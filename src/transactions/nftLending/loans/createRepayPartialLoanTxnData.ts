import { BN, web3 } from 'fbonds-core'
import { BASE_POINTS, EMPTY_PUBKEY, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { getMockBondOffer } from 'fbonds-core/lib/fbond-protocol/functions/getters'
import { repayPartialPerpetualLoan } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import {
  calculateLoanRepayValueOnCertainDate,
  isBanxSolTokenType,
  isLoanTerminating,
} from '@banx/utils'

import { sendTxnPlaceHolder } from '../../helpers'

type CreateRepayPartialLoanTxnDataParams = {
  loan: core.Loan
  fractionToRepay: number //? F.E 50% => 5000
  walletAndConnection: WalletAndConnection
}

type CreateRepayPartialLoanTxnData = (
  params: CreateRepayPartialLoanTxnDataParams,
) => Promise<CreateTxnData<core.Loan>>

export const createRepayPartialLoanTxnData: CreateRepayPartialLoanTxnData = async ({
  fractionToRepay,
  loan,
  walletAndConnection,
}) => {
  const { connection, wallet } = walletAndConnection

  const { fraktBond, bondTradeTransaction, nft } = loan

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
      userPubkey: new web3.PublicKey(wallet.publicKey || EMPTY_PUBKEY),
      protocolFeeReceiver: new web3.PublicKey(BONDS.ADMIN_PUBKEY),
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const lookupTables = [new web3.PublicKey(LOOKUP_TABLE)]

  const optimisticResult: core.Loan = optimisticResults.map((optimistic) => ({
    publicKey: optimistic.fraktBond.publicKey,
    fraktBond: optimistic.fraktBond,
    bondTradeTransaction: optimistic.bondTradeTransaction,
    nft,
  }))[0]

  //? Add BanxSol instructions if offer wasn't closed!
  if (
    isBanxSolTokenType(bondTradeTransaction.lendingToken) &&
    !loan.offerWasClosed &&
    !isLoanTerminating(loan)
  ) {
    const repayValue = calculateLoanRepayValueOnCertainDate({
      loan,
      upfrontFeeIncluded: false,
      //? It is necessary to add some time because interest is accumulated even during the transaction processing.
      //? There may not be enough funds for repayment. Therefore, we should add a small reserve for this dust.
      date: moment().unix() + 180,
    })
      .mul(new BN(fractionToRepay))
      .div(new BN(BASE_POINTS))

    return await banxSol.combineWithBuyBanxSolInstructions({
      inputAmount: repayValue,
      walletAndConnection,
      instructions,
      signers,
      lookupTables,
      result: optimisticResult,
    })
  }

  return {
    instructions,
    signers,
    lookupTables,
    result: optimisticResult,
  }
}
