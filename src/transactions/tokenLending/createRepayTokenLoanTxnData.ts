import { web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { repayPerpetualLoanSpl } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import {
  calculateTokenLoanRepayValueOnCertainDate,
  isBanxSolTokenType,
  isSolTokenType,
} from '@banx/utils'

import { sendTxnPlaceHolder } from '../helpers'

export type CreateRepayTokenLoanTxnDataParams = {
  loan: core.TokenLoan
}

type CreateRepayTokenLoanTxnData = (
  params: CreateRepayTokenLoanTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateRepayTokenLoanTxnDataParams>>

export const createRepayTokenLoanTxnData: CreateRepayTokenLoanTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loan } = params

  const {
    instructions,
    signers,
    accounts: accountsCollection,
  } = await repayPerpetualLoanSpl({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    accounts: {
      userPubkey: walletAndConnection.wallet.publicKey,
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
      oldBondOffer: new web3.PublicKey(loan.bondTradeTransaction.bondOffer),
      bondTradeTransaction: new web3.PublicKey(loan.bondTradeTransaction.publicKey),
      lender: new web3.PublicKey(loan.bondTradeTransaction.user),
      fbond: new web3.PublicKey(loan.fraktBond.publicKey),
      collateralTokenMint: new web3.PublicKey(loan.fraktBond.fbondTokenMint),
    },
    args: {
      lendingTokenType: loan.bondTradeTransaction.lendingToken,
    },
    connection: walletAndConnection.connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]

  const accounts = [accountsCollection['fraktBond'], accountsCollection['bondTradeTransaction']]

  if (
    isBanxSolTokenType(loan.bondTradeTransaction.lendingToken) ||
    isSolTokenType(loan.bondTradeTransaction.lendingToken)
  ) {
    const repayValue = calculateTokenLoanRepayValueOnCertainDate({
      loan,
      upfrontFeeIncluded: true,
      //? It is necessary to add some time because interest is accumulated even during the transaction processing.
      //? There may not be enough funds for repayment. Therefore, we should add a small reserve for this dust.
      date: moment().unix() + 180,
    })

    return await banxSol.combineWithBuyBanxSolInstructions(
      {
        params,
        accounts,
        inputAmount: repayValue,
        instructions,
        signers,
        lookupTables,
      },
      walletAndConnection,
    )
  }

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables,
  }
}
