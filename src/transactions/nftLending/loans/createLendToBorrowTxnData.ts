import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  lendToBorrowerListing,
  refinancePerpetualLoan,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { fetchTokenBalance } from '@banx/api/common'
import { core } from '@banx/api/nft'
import { BANX_SOL_ADDRESS, BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import {
  ZERO_BN,
  calculateLoanRepayValueOnCertainDate,
  isBanxSolTokenType,
  isLoanListed,
} from '@banx/utils'

import { sendTxnPlaceHolder } from '../../helpers'

export type CreateLendToBorrowTxnDataParams = {
  loan: core.Loan
  aprRate: number
  tokenType: LendingTokenType
}

type CreateLendToBorrowTxnData = (
  params: CreateLendToBorrowTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateLendToBorrowTxnDataParams>>

export const createLendToBorrowTxnData: CreateLendToBorrowTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loan, tokenType } = params

  const { instructions, signers, lookupTables } = await getIxnsAndSignersByLoanType(
    params,
    walletAndConnection,
  )

  const accounts: web3.PublicKey[] = []

  if (isBanxSolTokenType(tokenType) && !isLoanListed(loan)) {
    const banxSolBalance = await fetchTokenBalance({
      tokenAddress: BANX_SOL_ADDRESS,
      publicKey: walletAndConnection.wallet.publicKey,
      connection: walletAndConnection.connection,
    })

    const repayValue = calculateLoanRepayValueOnCertainDate({
      loan,
      upfrontFeeIncluded: true,
      //? It is necessary to add some time because interest is accumulated even during the transaction processing.
      //? There may not be enough funds for repayment. Therefore, we should add a small reserve for this dust.
      date: moment().unix() + 180,
    })

    const diff = repayValue.sub(banxSolBalance)

    if (diff.gt(ZERO_BN)) {
      return await banxSol.combineWithBuyBanxSolInstructions(
        {
          params,
          accounts,
          inputAmount: diff,
          instructions,
          signers,
          lookupTables,
        },
        walletAndConnection,
      )
    }
  }

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables,
  }
}

const getIxnsAndSignersByLoanType = async (
  params: CreateLendToBorrowTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => {
  const { loan, aprRate } = params
  const { connection, wallet } = walletAndConnection

  const { bondTradeTransaction, fraktBond } = loan

  if (isLoanListed(loan)) {
    const {
      instructions,
      signers,
      accounts: accountsCollection,
    } = await lendToBorrowerListing({
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
      connection,
      sendTxn: sendTxnPlaceHolder,
    })

    return {
      instructions,
      signers,
      accountsCollection,
      lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
    }
  }

  const {
    instructions,
    signers,
    accounts: accountsCollection,
  } = await refinancePerpetualLoan({
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
      newApr: new BN(aprRate),
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  return {
    instructions,
    signers,
    accountsCollection,
    lookupTables: [new web3.PublicKey(LOOKUP_TABLE)],
  }
}
