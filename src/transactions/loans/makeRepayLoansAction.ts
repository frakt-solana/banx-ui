import { web3 } from 'fbonds-core'
import { EMPTY_PUBKEY, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  BondAndTransactionOptimistic,
  repayCnftPerpetualLoan,
  repayPerpetualLoan,
  repayStakedBanxPerpetualLoan,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { getAssetProof } from 'fbonds-core/lib/fbond-protocol/helpers'
import { first, uniq } from 'lodash'

import { Loan } from '@banx/api/core'
import { BANX_STAKING, BONDS } from '@banx/constants'
import { WalletAndConnection } from '@banx/types'
import { sendTxnPlaceHolder } from '@banx/utils'

import { MakeActionFn } from '../TxnExecutor'
import { BorrowType } from '../constants'

export type MakeRepayLoansActionParams = Loan[]

export type MakeRepayActionResult = Loan[]

export type MakeRepayLoansAction = MakeActionFn<MakeRepayLoansActionParams, MakeRepayActionResult>

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
        userPubkey: wallet.publicKey as web3.PublicKey,
      },
      args: {
        repayAccounts: ixnParams.map(({ fraktBond, bondTradeTransaction }) => ({
          bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
          lender: new web3.PublicKey(bondTradeTransaction.user),
          fbond: new web3.PublicKey(fraktBond.publicKey),
          banxStake: new web3.PublicKey(fraktBond.banxStake),
          optimistic: { fraktBond, bondTradeTransaction } as BondAndTransactionOptimistic,
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

    const { instructions, signers, optimisticResults } = await repayCnftPerpetualLoan({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        userPubkey: wallet.publicKey as web3.PublicKey,
        bondTradeTransactionV2: new web3.PublicKey(loan.bondTradeTransaction.publicKey),
        lender: new web3.PublicKey(loan.bondTradeTransaction.user),
        fbond: new web3.PublicKey(loan.fraktBond.publicKey),
        tree: new web3.PublicKey(loan.nft.compression.tree),
      },
      args: {
        proof,
        cnftParams: loan.nft.compression,
        optimistic: {
          fraktBond: loan.fraktBond,
          bondTradeTransaction: loan.bondTradeTransaction,
        } as BondAndTransactionOptimistic,
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

  const { instructions, signers, optimisticResults } = await repayPerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: wallet.publicKey as web3.PublicKey,
    },
    args: {
      repayAccounts: ixnParams.map(({ fraktBond, bondTradeTransaction }) => ({
        bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
        lender: new web3.PublicKey(bondTradeTransaction.user),
        fbond: new web3.PublicKey(fraktBond.publicKey),
        collateralTokenMint: new web3.PublicKey(fraktBond.fbondTokenMint),
        optimistic: { fraktBond, bondTradeTransaction } as BondAndTransactionOptimistic,
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
