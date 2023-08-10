import { WalletContextState, useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'
import { web3 } from 'fbonds-core'

import { TxnError, captureSentryTxnError } from '@banx/utils'

import { signAndConfirmTransaction } from '../helpers'

type MakeTransactionFn<T> = (
  params: T & { connection: Connection; wallet: WalletContextState },
) => Promise<{ transaction: web3.Transaction; signers: web3.Signer[] }>

export type TransactionOptions<T> = {
  makeTransactionFn: MakeTransactionFn<T>
  transactionParams: T
  commitment?: web3.Commitment
}

export const useTransactionExecutor = () => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const executeTransaction = async (
    transaction: web3.Transaction,
    signers: web3.Signer[],
    commitment: web3.Commitment,
  ) => {
    try {
      await signAndConfirmTransaction({
        transaction,
        signers,
        wallet,
        connection,
        commitment,
      })
    } catch (error) {
      const txnError = error as TxnError
      captureSentryTxnError({ error: txnError })
    }
  }

  const buildAndExecuteTransaction = async <T>({
    makeTransactionFn,
    transactionParams,
    commitment = 'confirmed',
  }: TransactionOptions<T>) => {
    if (wallet.publicKey) {
      try {
        const { transaction, signers } = await makeTransactionFn({
          ...transactionParams,
          connection,
          wallet,
        })

        await executeTransaction(transaction, signers, commitment)
      } catch (error) {
        console.error(error)
      }
    }
  }

  return { buildAndExecuteTransaction }
}
