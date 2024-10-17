import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE, ZERO_BN } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  lendToBorrowerListing,
  refinancePerpetualLoan,
  updateLiquidityToUserVault,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { UserVault } from '@banx/api'
import { TokenLoan } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'
import {
  calculateTokenLoanRepayValueOnCertainDate,
  calculateTokenLoanValueWithUpfrontFee,
  isBanxSolTokenType,
  isTokenLoanListed,
} from '@banx/utils'

import { sendTxnPlaceHolder } from '../helpers'
import { banxSol } from '../index'

export type CreateLendToBorrowTokenTxnDataParams = {
  loan: TokenLoan
  aprRate: number
  tokenType: LendingTokenType
  userVault: UserVault | undefined
}

type CreateLendToBorrowTokenTxnData = (
  params: CreateLendToBorrowTokenTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateLendToBorrowTokenTxnDataParams>>

export const createLendToBorrowTokenTxnData: CreateLendToBorrowTokenTxnData = async (
  params,
  walletAndConnection,
) => {
  const { instructions, signers } = await getInstructionsAndSigners(params, walletAndConnection)

  const accounts: web3.PublicKey[] = []
  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables,
  }
}

const getInstructionsAndSigners = async (
  params: CreateLendToBorrowTokenTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => {
  const isListed = isTokenLoanListed(params.loan)

  return isListed
    ? await getIxnsAndSignersForListedLoan(params, walletAndConnection)
    : await getIxnsAndSignersForAuctionLoan(params, walletAndConnection)
}

const getIxnsAndSignersForListedLoan = async (
  params: CreateLendToBorrowTokenTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => {
  const { loan, userVault } = params
  const { connection, wallet } = walletAndConnection

  const { bondTradeTransaction, fraktBond } = loan

  const userVaultBalance = userVault?.offerLiquidityAmount ?? ZERO_BN

  const instructions: web3.TransactionInstruction[] = []
  const signers: web3.Signer[] = []

  const amount = BN.min(userVaultBalance, calculateTokenLoanValueWithUpfrontFee(loan))
  const lendingTokenType = bondTradeTransaction.lendingToken

  if (userVault && !userVault.offerLiquidityAmount.isZero()) {
    const liquidityIxns = await updateLiquidityToUserVault({
      connection,
      args: {
        amount,
        lendingTokenType,
        add: false,
      },
      accounts: {
        userPubkey: wallet.publicKey,
      },
      sendTxn: sendTxnPlaceHolder,
    })

    if (isBanxSolTokenType(lendingTokenType)) {
      const buyBanxSolIxns = await banxSol.combineWithSellBanxSolInstructions(
        {
          params,
          inputAmount: amount,
          instructions: liquidityIxns.instructions,
          signers: liquidityIxns.signers,
        },
        walletAndConnection,
      )

      instructions.push(...buyBanxSolIxns.instructions)
      signers.push(...(buyBanxSolIxns.signers ?? []))
    } else {
      instructions.push(...liquidityIxns.instructions)
      signers.push(...liquidityIxns.signers)
    }
  }

  const lendToBorrowIxns = await lendToBorrowerListing({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      hadoMarket: new web3.PublicKey(fraktBond.hadoMarket),
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      borrower: new web3.PublicKey(fraktBond.fbondIssuer),
      userPubkey: wallet.publicKey,
      bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
      oldBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      fraktBond: new web3.PublicKey(fraktBond.publicKey),
    },
    args: {
      lendingTokenType: bondTradeTransaction.lendingToken,
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  instructions.push(...lendToBorrowIxns.instructions)
  signers.push(...lendToBorrowIxns.signers)

  return { instructions, signers }
}

const getIxnsAndSignersForAuctionLoan = async (
  params: CreateLendToBorrowTokenTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => {
  const { loan, aprRate, userVault } = params
  const { connection, wallet } = walletAndConnection

  const { bondTradeTransaction, fraktBond } = loan

  const userVaultBalance = userVault?.offerLiquidityAmount ?? ZERO_BN

  const instructions: web3.TransactionInstruction[] = []
  const signers: web3.Signer[] = []

  const repayValue = calculateTokenLoanRepayValueOnCertainDate({
    loan,
    date: moment().unix(),
  })

  const amount = BN.min(userVaultBalance, repayValue)

  if (userVault && !userVault.offerLiquidityAmount.isZero()) {
    const liquidityIxns = await updateLiquidityToUserVault({
      connection,
      args: {
        amount: amount,
        lendingTokenType: bondTradeTransaction.lendingToken,
        add: false,
      },
      accounts: {
        userPubkey: wallet.publicKey,
      },
      sendTxn: sendTxnPlaceHolder,
    })

    instructions.push(...liquidityIxns.instructions)
    signers.push(...liquidityIxns.signers)
  }

  const refinanceIxns = await refinancePerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: wallet.publicKey,
      hadoMarket: new web3.PublicKey(fraktBond.hadoMarket),
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      previousBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      previousLender: new web3.PublicKey(bondTradeTransaction.user),
      oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
    },
    args: {
      lendingTokenType: bondTradeTransaction.lendingToken,
      newApr: new BN(aprRate),
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  instructions.push(...refinanceIxns.instructions)
  signers.push(...refinanceIxns.signers)

  const remainingRepayAmount = repayValue.sub(amount)
  if (!remainingRepayAmount.isZero()) {
    return await banxSol.combineWithBuyBanxSolInstructions(
      {
        params,
        inputAmount: remainingRepayAmount,
        instructions,
        signers,
      },
      walletAndConnection,
    )
  }

  return { instructions, signers }
}
