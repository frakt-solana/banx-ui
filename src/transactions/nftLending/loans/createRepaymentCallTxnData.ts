import { web3 } from 'fbonds-core'
import { setRepaymentCall } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondTradeTransactionV3 } from 'fbonds-core/lib/fbond-protocol/types'
import { chain } from 'lodash'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import { parseBanxAccountInfo } from '@banx/transactions/functions'

import { sendTxnPlaceHolder } from '../../helpers'

export type CreateRepaymentCallTxnDataParams = {
  loan: core.Loan
  callAmount: number
}

type CreateRepaymentCallTxnData = (
  params: CreateRepaymentCallTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateRepaymentCallTxnDataParams>>

export const createRepaymentCallTxnData: CreateRepaymentCallTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loan, callAmount } = params
  const { wallet, connection } = walletAndConnection
  const { bondTradeTransaction, fraktBond } = loan

  const {
    instructions,
    signers,
    optimistic: optimisticResult,
  } = await setRepaymentCall({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    args: {
      callAmount,
    },
    optimistic: {
      bondTradeTransaction,
    },
    accounts: {
      bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      fraktBond: new web3.PublicKey(fraktBond.publicKey),
      userPubkey: wallet.publicKey,
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const accounts = [new web3.PublicKey(optimisticResult.bondTradeTransaction.publicKey)]

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables: [],
  }
}

//TODO Move results logic into shared separate function?
export const parseRepaymentCallSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = chain(accountInfoByPubkey)
    .toPairs()
    .filter(([, info]) => !!info)
    .map(([publicKey, info]) => {
      return parseBanxAccountInfo(new web3.PublicKey(publicKey), info)
    })
    .fromPairs()
    .value()

  return results?.['bondTradeTransactionV3'] as BondTradeTransactionV3
}
