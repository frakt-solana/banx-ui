import { BN, web3 } from 'fbonds-core'
import { BASE_POINTS, EMPTY_PUBKEY, LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import { repayPartialPerpetualLoan } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import {
  calculateLoanRepayValueOnCertainDate,
  isBanxSolTokenType,
  isSolTokenType,
} from '@banx/utils'

import { parseAccountInfoByPubkey } from '../../functions'
import { sendTxnPlaceHolder } from '../../helpers'

export type CreateRepayPartialLoanTxnDataParams = {
  loan: core.Loan
  fractionToRepay: number //? F.E 50% => 5000
}

type CreateRepayPartialLoanTxnData = (
  params: CreateRepayPartialLoanTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateRepayPartialLoanTxnDataParams>>

export const createRepayPartialLoanTxnData: CreateRepayPartialLoanTxnData = async (
  params,
  walletAndConnection,
) => {
  const { fractionToRepay, loan } = params
  const { connection, wallet } = walletAndConnection

  const { fraktBond, bondTradeTransaction } = loan

  const {
    instructions,
    signers,
    accounts: accountsCollection,
  } = await repayPartialPerpetualLoan({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    args: {
      fractionToRepay,
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

  const accounts = [accountsCollection['fraktBond'], accountsCollection['oldBondTradeTransaction']]

  //? Add BanxSol instructions if offer wasn't closed!
  if (
    isBanxSolTokenType(bondTradeTransaction.lendingToken) ||
    isSolTokenType(bondTradeTransaction.lendingToken)
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

export const parseRepayPartialLoanSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)

  return {
    bondTradeTransaction: results?.['bondTradeTransactionV3']?.[0] as core.BondTradeTransaction,
    fraktBond: results?.['fraktBond']?.[0] as core.FraktBond,
  }
}
