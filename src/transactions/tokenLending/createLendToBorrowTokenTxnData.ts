import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import {
  lendToBorrowerListing,
  refinancePerpetualLoan,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import {
  calculateTokenLoanRepayValueOnCertainDate,
  isBanxSolTokenType,
  isTokenLoanListed,
} from '@banx/utils'

import { sendTxnPlaceHolder } from '../helpers'

type CreateLendToBorrowTokenTxnDataParams = {
  loan: core.TokenLoan
  aprRate: number
  tokenType: LendingTokenType
  walletAndConnection: WalletAndConnection
}

export type CreateLendToBorrowActionOptimisticResult = {
  loan: core.TokenLoan
  oldLoan: core.TokenLoan
}

type CreateLendToBorrowTokenTxnData = (
  params: CreateLendToBorrowTokenTxnDataParams,
) => Promise<CreateTxnData<CreateLendToBorrowActionOptimisticResult>>

export const createLendToBorrowTokenTxnData: CreateLendToBorrowTokenTxnData = async (params) => {
  const { loan, tokenType } = params

  const { instructions, signers, optimisticResult, lookupTables } =
    await getIxnsAndSignersByLoanType(params)

  const optimisticLoan = {
    ...loan,
    fraktBond: optimisticResult.fraktBond,
    bondTradeTransaction: optimisticResult.bondTradeTransaction,
  }

  if (isBanxSolTokenType(tokenType) && !isTokenLoanListed(loan)) {
    const repayValue = calculateTokenLoanRepayValueOnCertainDate({
      loan,
      upfrontFeeIncluded: true,
      //? It is necessary to add some time because interest is accumulated even during the transaction processing.
      //? There may not be enough funds for repayment. Therefore, we should add a small reserve for this dust.
      date: moment().unix() + 180,
    })

    return await banxSol.combineWithBuyBanxSolInstructions({
      inputAmount: new BN(repayValue),
      walletAndConnection: params.walletAndConnection,
      instructions,
      signers,
      lookupTables,
      result: { loan: optimisticLoan, oldLoan: loan },
    })
  }

  return {
    instructions,
    signers,
    result: { loan: optimisticLoan, oldLoan: loan },
    lookupTables,
  }
}

const getIxnsAndSignersByLoanType = async (params: CreateLendToBorrowTokenTxnDataParams) => {
  const { loan, aprRate, walletAndConnection } = params
  const { connection, wallet } = walletAndConnection

  const { bondTradeTransaction, fraktBond } = loan

  if (isTokenLoanListed(loan)) {
    const { instructions, signers, optimisticResults } = await lendToBorrowerListing({
      programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
      accounts: {
        hadoMarket: new web3.PublicKey(fraktBond.hadoMarket || ''),
        protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
        borrower: new web3.PublicKey(loan.fraktBond.fbondIssuer),
        userPubkey: wallet.publicKey,
        bondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
        oldBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
        fraktBond: new web3.PublicKey(fraktBond.publicKey),
      },
      args: {
        lendingTokenType: bondTradeTransaction.lendingToken,
      },
      optimistic: {
        bondTradeTransaction,
        fraktBond,
      },
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    const newOptimisticResult = {
      fraktBond: optimisticResults.fraktBond,
      bondTradeTransaction: optimisticResults.bondTradeTransaction,
    }

    return {
      instructions,
      signers,
      optimisticResult: newOptimisticResult,
      lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    }
  }

  const { instructions, signers, optimisticResult } = await refinancePerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: wallet.publicKey,
      hadoMarket: new web3.PublicKey(fraktBond.hadoMarket || ''),
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      previousBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      previousLender: new web3.PublicKey(bondTradeTransaction.user),
      oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
    },
    args: {
      lendingTokenType: bondTradeTransaction.lendingToken,
      newApr: aprRate,
    },
    optimistic: {
      fraktBond,
      oldBondOffer: getMockBondOffer(),
      bondTradeTransaction,
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const newOptimisticResult = {
    fraktBond: optimisticResult.fraktBond,
    bondTradeTransaction: optimisticResult.newBondTradeTransaction,
  }

  return {
    instructions,
    signers,
    optimisticResult: newOptimisticResult,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}
