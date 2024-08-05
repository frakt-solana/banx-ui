import { BN, web3 } from 'fbonds-core'
import { setRepaymentCall } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import {
  CreateTxnData,
  SimulatedAccountInfoByPubkey,
  WalletAndConnection,
} from 'solana-transactions-executor'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'

import { parseAccountInfoByPubkey } from '../../functions'
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
  const { bondTradeTransaction } = loan

  const {
    instructions,
    signers,
    accounts: accountsCollection,
  } = await setRepaymentCall({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    args: {
      callAmount: new BN(callAmount),
    },
    accounts: {
      bondTradeTransaction: new web3.PublicKey(bondTradeTransaction.publicKey),
      userPubkey: wallet.publicKey,
    },
    connection,
    sendTxn: sendTxnPlaceHolder,
  })

  const accounts = [accountsCollection['bondTradeTransaction']]

  return {
    params,
    accounts,
    instructions,
    signers,
    lookupTables: [],
  }
}

export const parseRepaymentCallSimulatedAccounts = (
  accountInfoByPubkey: SimulatedAccountInfoByPubkey,
) => {
  const results = parseAccountInfoByPubkey(accountInfoByPubkey)

  return results?.['bondTradeTransactionV3'] as core.BondTradeTransaction
}
