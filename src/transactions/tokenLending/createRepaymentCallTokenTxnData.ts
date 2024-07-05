import { web3 } from 'fbonds-core'
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
