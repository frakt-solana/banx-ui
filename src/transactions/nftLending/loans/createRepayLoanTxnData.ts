import { BN, web3 } from 'fbonds-core'
import {
  EMPTY_PUBKEY,
  LOOKUP_TABLE,
  SANCTUM_PROGRAMM_ID,
} from 'fbonds-core/lib/fbond-protocol/constants'
import {
  SwapMode,
  closeTokenAccountBanxSol,
  swapSolToBanxSol,
} from 'fbonds-core/lib/fbond-protocol/functions/banxSol'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import {
  calculateCurrentInterestSolPure,
  repayCnftPerpetualLoanCanopy,
  repayPerpetualLoan,
  repayStakedBanxPerpetualLoan,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { helius } from '@banx/api/common'
import { core } from '@banx/api/nft'
import { BANX_SOL, BANX_STAKING, BONDS } from '@banx/constants'

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

const calculateLoanRepayValueForRepay = (loan: core.Loan) => {
  const { solAmount, feeAmount, soldAt, amountOfBonds } = loan.bondTradeTransaction || {}

  const loanValue = solAmount + feeAmount

  const calculatedInterest = calculateCurrentInterestSolPure({
    loanValue,
    startTime: soldAt,
    currentTime: moment().unix() + 60,
    rateBasePoints: amountOfBonds + BONDS.PROTOCOL_REPAY_FEE,
  })

  return loanValue + calculatedInterest
}

export const createRepayLoanTxnData: CreateRepayLoanTxnData = async ({
  loan,
  walletAndConnection,
}) => {
  const borrowType = getLoanBorrowType(loan)

  const loanValue = calculateLoanRepayValueForRepay(loan)

  const { instructions: swapInstructions, signers: swapSigners } = await swapSolToBanxSol({
    programId: SANCTUM_PROGRAMM_ID,
    connection: walletAndConnection.connection,
    accounts: {
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    args: {
      amount: new BN(Math.ceil(loanValue / BANX_SOL.SOL_TO_BANXSOL_RATIO)),
      banxSolLstIndex: 29,
      wSolLstIndex: 1,
      swapMode: SwapMode.SolToBanxSol,
    },
    sendTxn: sendTxnPlaceHolder,
  })

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

  const { instructions: closeInstructions, signers: closeSigners } = await closeTokenAccountBanxSol(
    {
      connection: walletAndConnection.connection,
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        feeReciver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
        userPubkey: walletAndConnection.wallet.publicKey,
      },
      sendTxn: sendTxnPlaceHolder,
    },
  )

  const optimisticLoan: core.Loan = {
    publicKey: optimisticResult.fraktBond.publicKey,
    fraktBond: optimisticResult.fraktBond,
    bondTradeTransaction: optimisticResult.bondTradeTransaction,
    nft: loan.nft,
  }

  return {
    instructions: [...swapInstructions, ...repayInstructions, ...closeInstructions],
    signers: [...swapSigners, ...repaySigners, ...closeSigners],
    lookupTables,
    result: optimisticLoan,
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
