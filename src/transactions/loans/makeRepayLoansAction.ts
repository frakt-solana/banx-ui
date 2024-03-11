import { web3 } from 'fbonds-core'
import { EMPTY_PUBKEY, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import {
  BondAndTransactionOptimistic,
  repayCnftPerpetualLoanCanopy,
  repayPerpetualLoan,
  repayStakedBanxPerpetualLoan,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { getAssetProof } from 'fbonds-core/lib/fbond-protocol/helpers'
import { BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'
import { first, uniq } from 'lodash'
import { MakeActionFn, WalletAndConnection } from 'solana-transactions-executor'

import { Loan } from '@banx/api/core'
import { BANX_STAKING, BONDS } from '@banx/constants'
import { sendTxnPlaceHolder } from '@banx/utils'

import { BorrowType } from '../constants'
import { fetchRuleset } from '../functions'

export type MakeRepayLoansActionParams = Loan[]

export type MakeRepayActionResult = Loan[]

export type MakeRepayLoansAction = MakeActionFn<MakeRepayLoansActionParams, MakeRepayActionResult>

interface OptimisticResult extends BondAndTransactionOptimistic {
  oldBondOffer: BondOfferV2
}

export const LOANS_PER_TXN = 1

export const makeRepayLoansAction: MakeRepayLoansAction = async (
  ixnParams,
  walletAndConnection,
) => {
  const borrowType = getChunkBorrowType(ixnParams)

  if (ixnParams.length > REPAY_NFT_PER_TXN[borrowType]) {
    throw new Error(`Maximum borrow per txn is ${REPAY_NFT_PER_TXN[borrowType]}`)
  }

  const { instructions, signers, optimisticResults, lookupTables } =
    await getIxnsAndSignersByBorrowType({
      ixnParams,
      type: borrowType,
      walletAndConnection,
    })

  const loans: Loan[] = optimisticResults.map((optimistic, idx) => ({
    publicKey: optimistic.fraktBond.publicKey,
    fraktBond: optimistic.fraktBond,
    bondTradeTransaction: optimistic.bondTradeTransaction,
    nft: ixnParams[idx].nft,
  }))

  return {
    instructions,
    signers,
    lookupTables,
    additionalResult: loans,
  }
}

const getIxnsAndSignersByBorrowType = async ({
  ixnParams,
  type = BorrowType.Default,
  walletAndConnection,
}: {
  ixnParams: MakeRepayLoansActionParams
  type?: BorrowType
  walletAndConnection: WalletAndConnection
}) => {
  const { connection, wallet } = walletAndConnection

  if (type === BorrowType.StakedBanx) {
    const loan = ixnParams[0]
    if (
      !(
        loan.fraktBond.banxStake !== EMPTY_PUBKEY.toBase58() &&
        loan.fraktBond.fraktMarket === BANX_STAKING.FRAKT_MARKET
      )
    ) {
      throw new Error(`Not BanxStaked NFT`)
    }
    const { instructions, signers, optimisticResults } = await repayStakedBanxPerpetualLoan({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        oldBondOffer: new web3.PublicKey(loan.bondTradeTransaction.bondOffer),
        userPubkey: wallet.publicKey as web3.PublicKey,
        protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      },
      args: {
        repayAccounts: ixnParams.map(({ fraktBond, bondTradeTransaction }) => ({
          bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
          lender: new web3.PublicKey(bondTradeTransaction.user),
          fbond: new web3.PublicKey(fraktBond.publicKey),
          banxStake: new web3.PublicKey(fraktBond.banxStake),
          optimistic: {
            fraktBond,
            bondTradeTransaction,
            oldBondOffer: getMockBondOffer(),
          } as OptimisticResult,
        })),
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })
    return {
      instructions,
      signers,
      optimisticResults,
      lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    }
  }

  if (type === BorrowType.CNft) {
    const loan = ixnParams[0]
    if (!loan.nft.compression) {
      throw new Error(`Not cNFT`)
    }

    const proof = await getAssetProof(loan.nft.mint, connection.rpcEndpoint)

    const { instructions, signers, optimisticResults } = await repayCnftPerpetualLoanCanopy({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        oldBondOffer: new web3.PublicKey(loan.bondTradeTransaction.bondOffer),
        userPubkey: wallet.publicKey as web3.PublicKey,
        bondTradeTransaction: new web3.PublicKey(loan.bondTradeTransaction.publicKey),
        lender: new web3.PublicKey(loan.bondTradeTransaction.user),
        fbond: new web3.PublicKey(loan.fraktBond.publicKey),
        tree: new web3.PublicKey(loan.nft.compression.tree),
        protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      },
      args: {
        proof,
        cnftParams: loan.nft.compression,
        optimistic: {
          fraktBond: loan.fraktBond,
          bondTradeTransaction: loan.bondTradeTransaction,
          oldBondOffer: getMockBondOffer(),
        } as OptimisticResult,
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return {
      instructions,
      signers,
      optimisticResults,
      lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    }
  }

  const ruleSets = await Promise.all(
    ixnParams.map(({ nft, fraktBond }) =>
      fetchRuleset({ nftMint: nft.mint, connection, marketPubkey: fraktBond.hadoMarket }),
    ),
  )

  const { instructions, signers, optimisticResults } = await repayPerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: wallet.publicKey as web3.PublicKey,
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      oldBondOffer: new web3.PublicKey(ixnParams[0].bondTradeTransaction.bondOffer),
    },
    addComputeUnits: true,
    args: {
      repayAccounts: ixnParams.map(({ fraktBond, bondTradeTransaction }, idx) => ({
        bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
        ruleSet: ruleSets[idx],
        lender: new web3.PublicKey(bondTradeTransaction.user),
        fbond: new web3.PublicKey(fraktBond.publicKey),
        collateralTokenMint: new web3.PublicKey(fraktBond.fbondTokenMint),
        optimistic: {
          fraktBond,
          oldBondOffer: getMockBondOffer(),
          bondTradeTransaction,
        } as OptimisticResult,
      })),
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    instructions,
    signers,
    optimisticResults,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}

const getChunkBorrowType = (loans: Loan[]) => {
  const types = loans.map((nft) => getLoanBorrowType(nft))

  if (uniq(types).length > 1) {
    throw new Error('Nfts in chunk have different borrow type')
  }

  return first(types) ?? BorrowType.Default
}

export const getLoanBorrowType = (loan: Loan) => {
  if (
    loan.fraktBond.banxStake !== EMPTY_PUBKEY.toBase58() &&
    loan.fraktBond.fraktMarket === BANX_STAKING.FRAKT_MARKET
  )
    return BorrowType.StakedBanx
  if (loan.nft.compression) return BorrowType.CNft
  return BorrowType.Default
}

export const REPAY_NFT_PER_TXN = {
  [BorrowType.StakedBanx]: 1,
  [BorrowType.CNft]: 1,
  [BorrowType.Default]: 1,
}
