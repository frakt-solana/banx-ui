import { BN, web3 } from 'fbonds-core'
import { BASE_POINTS, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import { repayPartialPerpetualLoan } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
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

export type CreateRepayPartialTokenLoanTxnDataParams = {
  loan: core.TokenLoan
  fractionToRepay: number //? F.E 50% => 5000
}

type CreateRepayPartialTokenLoanTxnData = (
  params: CreateRepayPartialTokenLoanTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateRepayPartialTokenLoanTxnDataParams>>

export const createRepayPartialTokenLoanTxnData: CreateRepayPartialTokenLoanTxnData = async (
  params,
  walletAndConnection,
) => {
  const { fractionToRepay, loan } = params
  const { connection, wallet } = walletAndConnection

  const { fraktBond, bondTradeTransaction } = loan

  const { instructions, signers, optimisticResults } = await repayPartialPerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    args: {
      fractionToRepay,
      optimistic: {
        fraktBond,
        bondTradeTransaction,
        oldBondOffer: getMockBondOffer(),
      },
      lendingTokenType: bondTradeTransaction.lendingToken,
    },
    accounts: {
      oldBondOffer: new web3.PublicKey(bondTradeTransaction.bondOffer),
      lender: new web3.PublicKey(bondTradeTransaction.user),
      oldBondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      fbond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: new web3.PublicKey(wallet.publicKey),
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]

  const accounts = [
    new web3.PublicKey(optimisticResults[0].fraktBond.publicKey),
    new web3.PublicKey(optimisticResults[0].bondTradeTransaction.publicKey),
  ]

  if (
    isBanxSolTokenType(bondTradeTransaction.lendingToken) ||
    isSolTokenType(bondTradeTransaction.lendingToken)
  ) {
    const repayValue = calculateTokenLoanRepayValueOnCertainDate({
      loan,
      upfrontFeeIncluded: false,
      //? It is necessary to add some time because interest is accumulated even during the transaction processing.
      //? There may not be enough funds for repayment. Therefore, we should add a small reserve for this dust.
      date: moment().unix() + 180,
    })
      .mul(new BN(fractionToRepay))
      .div(new BN(BASE_POINTS))

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
