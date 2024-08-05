import { BN, web3 } from 'fbonds-core'
import { setRepaymentCall } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { core } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'

import { sendTxnPlaceHolder } from '../helpers'

export type CreateRepaymentCallTokenTxnDataParams = {
  loan: core.TokenLoan
  callAmount: number
}

type CreateRepaymentCallTokenTxnData = (
  params: CreateRepaymentCallTokenTxnDataParams,
  walletAndConnection: WalletAndConnection,
) => Promise<CreateTxnData<CreateRepaymentCallTokenTxnDataParams>>

export const createRepaymentCallTokenTxnData: CreateRepaymentCallTokenTxnData = async (
  params,
  walletAndConnection,
) => {
  const { loan, callAmount } = params
  const { wallet, connection } = walletAndConnection

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
      bondTradeTransaction: new web3.PublicKey(loan.bondTradeTransaction.publicKey),
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
