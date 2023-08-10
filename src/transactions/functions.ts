import { WalletContextState } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'
import { web3 } from 'fbonds-core'

import { TxnError, captureSentryTxnError } from '@banx/utils'

import { signAndConfirmTransaction } from './helpers'

export type MakeTransactionFn<T> = (
  params: T & { connection: Connection; wallet: WalletContextState },
) => Promise<{ transaction: web3.Transaction; signers: web3.Signer[] }>

export type TransactionOptions<T> = {
  makeTransactionFn: MakeTransactionFn<T>
  transactionParams: T
  commitment?: web3.Commitment
  connection: Connection
  wallet: WalletContextState
}

const executeTransaction = async (props: {
  transaction: web3.Transaction
  signers: web3.Signer[]
  commitment: web3.Commitment
  wallet: WalletContextState
  connection: Connection
}) => {
  try {
    await signAndConfirmTransaction({ ...props })
  } catch (error) {
    const txnError = error as TxnError
    captureSentryTxnError({ error: txnError })
  }
}

export const buildAndExecuteTransaction = async <T, R>({
  makeTransactionFn,
  transactionParams,
  commitment = 'confirmed',
  wallet,
  connection,
}: TransactionOptions<T>): Promise<R | undefined> => {
  if (!wallet.publicKey) {
    return undefined
  }

  try {
    const { transaction, signers, ...rest } = await makeTransactionFn({
      ...transactionParams,
      connection,
      wallet,
    })

    await executeTransaction({ transaction, signers, commitment, wallet, connection })

    return { transaction, signers, ...rest } as R
  } catch (error) {
    console.error(error)
  }
}
