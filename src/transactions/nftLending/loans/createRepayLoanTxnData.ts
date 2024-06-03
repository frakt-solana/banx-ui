import { web3 } from 'fbonds-core'
import { EMPTY_PUBKEY, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import {
  repayCnftPerpetualLoanCanopy,
  repayPerpetualLoan,
  repayStakedBanxPerpetualLoan,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { helius } from '@banx/api/common'
import { core } from '@banx/api/nft'
import { BANX_STAKING, BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import { calculateLoanRepayValueOnCertainDate, isBanxSolTokenType } from '@banx/utils'

import { fetchRuleset } from '../../functions'
import { sendTxnPlaceHolder } from '../../helpers'
import { BorrowType } from '../types'

type CreateRepayLoanTxnDataParams = {
  loan: core.Loan
  walletAndConnection: WalletAndConnection
}

type CreateRepayLoanTxnData = (
  params: CreateRepayLoanTxnDataParams,
) => Promise<CreateTxnData<core.Loan>>

export const createRepayLoanTxnData: CreateRepayLoanTxnData = async ({
  loan,
  walletAndConnection,
}) => {
  const borrowType = getLoanBorrowType(loan)

  const {
    instructions: repayInstructions,
    signers: repaySigners,
    optimisticResult,
    lookupTables,
  } = await getIxnsAndSignersByBorrowType({
    loan,
    borrowType,
    walletAndConnection,
  })

  const optimisticLoan: core.Loan = {
    publicKey: optimisticResult.fraktBond.publicKey,
    fraktBond: optimisticResult.fraktBond,
    bondTradeTransaction: optimisticResult.bondTradeTransaction,
    nft: loan.nft,
  }

  if (isBanxSolTokenType(loan.bondTradeTransaction.lendingToken)) {
    const repayValue = calculateLoanRepayValueOnCertainDate({
      loan,
      upfrontFeeIncluded: true,
      date: moment().unix() + 180,
    })

    return await banxSol.combineWithBuyBanxSolInstructions({
      inputAmount: repayValue,
      walletAndConnection,
      instructions: repayInstructions,
      signers: repaySigners,
      lookupTables,
      result: optimisticLoan,
    })
  }

  return {
    instructions: repayInstructions,
    signers: repaySigners,
    result: optimisticLoan,
    lookupTables,
  }
}

const getIxnsAndSignersByBorrowType = async ({
  loan,
  borrowType,
  walletAndConnection,
}: CreateRepayLoanTxnDataParams & {
  borrowType: BorrowType
}) => {
  const { connection, wallet } = walletAndConnection

  const { bondTradeTransaction, fraktBond, nft } = loan

  if (borrowType === BorrowType.StakedBanx) {
    if (
      !(
        fraktBond.banxStake !== EMPTY_PUBKEY.toBase58() &&
        fraktBond.fraktMarket === BANX_STAKING.FRAKT_MARKET
      )
    ) {
      throw new Error(`Not BanxStaked NFT`)
    }

    const { instructions, signers, optimisticResults } = await repayStakedBanxPerpetualLoan({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
        userPubkey: wallet.publicKey,
        protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      },
      args: {
        repayAccounts: [
          {
            bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
            lender: new web3.PublicKey(bondTradeTransaction.user),
            fbond: new web3.PublicKey(fraktBond.publicKey),
            banxStake: new web3.PublicKey(fraktBond.banxStake),
            optimistic: {
              fraktBond,
              bondTradeTransaction,
              oldBondOffer: getMockBondOffer(),
            },
          },
        ],
        lendingTokenType: bondTradeTransaction.lendingToken,
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return {
      instructions,
      signers,
      optimisticResult: optimisticResults[0],
      lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    }
  }

  if (borrowType === BorrowType.CNft) {
    if (!nft.compression) {
      throw new Error(`Not cNFT`)
    }

    const proof = await helius.getHeliusAssetProof({ assetId: nft.mint, connection })

    const { instructions, signers, optimisticResults } = await repayCnftPerpetualLoanCanopy({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
        userPubkey: wallet.publicKey,
        bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
        lender: new web3.PublicKey(bondTradeTransaction.user),
        fbond: new web3.PublicKey(fraktBond.publicKey),
        tree: new web3.PublicKey(nft.compression.tree),
        protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      },
      args: {
        proof,
        cnftParams: nft.compression,
        optimistic: {
          fraktBond: fraktBond,
          bondTradeTransaction: bondTradeTransaction,
          oldBondOffer: getMockBondOffer(),
        },
        lendingTokenType: bondTradeTransaction.lendingToken,
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return {
      instructions,
      signers,
      optimisticResult: optimisticResults[0],
      lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    }
  }

  const ruleSet = await fetchRuleset({
    nftMint: nft.mint,
    connection,
    marketPubkey: fraktBond.hadoMarket,
  })

  const { instructions, signers, optimisticResults } = await repayPerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: wallet.publicKey,
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
    },
    args: {
      repayAccounts: [
        {
          bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
          ruleSet,
          lender: new web3.PublicKey(bondTradeTransaction.user),
          fbond: new web3.PublicKey(fraktBond.publicKey),
          collateralTokenMint: new web3.PublicKey(fraktBond.fbondTokenMint),
          optimistic: {
            fraktBond,
            oldBondOffer: getMockBondOffer(),
            bondTradeTransaction,
          },
        },
      ],
      lendingTokenType: bondTradeTransaction.lendingToken,
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    instructions,
    signers,
    optimisticResult: optimisticResults[0],
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}

export const getLoanBorrowType = (loan: core.Loan) => {
  if (
    loan.fraktBond.banxStake !== EMPTY_PUBKEY.toBase58() &&
    loan.fraktBond.fraktMarket === BANX_STAKING.FRAKT_MARKET
  )
    return BorrowType.StakedBanx
  if (loan.nft.compression) return BorrowType.CNft
  return BorrowType.Default
}
