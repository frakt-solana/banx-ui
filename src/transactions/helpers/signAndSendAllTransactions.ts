import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'

import { TxnError, TxnsAndSigners } from '../types'
import { defaultTxnErrorHandler } from './defaultTxnErrorHandler'

interface SignAndSendAllTransactionsProps {
  transactionsAndSigners: TxnsAndSigners[]
  connection: web3.Connection
  wallet: WalletContextState
  commitment?: web3.Commitment
  onBeforeApprove?: () => void
  onSuccess?: () => void
}

type SignAndSendAllTransactions = (
  props: SignAndSendAllTransactionsProps,
) => Promise<boolean | undefined>

export const signAndSendAllTransactions: SignAndSendAllTransactions = async ({
  transactionsAndSigners,
  connection,
  wallet,
  commitment = 'confirmed',
  onBeforeApprove,
  onSuccess,
}) => {
  try {
    if (!wallet.publicKey || !wallet.signAllTransactions) return undefined

    onBeforeApprove?.()

    const { blockhash } = await connection.getLatestBlockhash(commitment)

    const transactions = transactionsAndSigners.map(({ transaction, signers }) => {
      transaction.recentBlockhash = blockhash
      transaction.feePayer = wallet.publicKey as web3.PublicKey

      if (signers?.length) {
        transaction.sign(...signers)
      }

      return transaction
    })

    const signedTransactions = await wallet.signAllTransactions(transactions)

    await Promise.all(
      signedTransactions.map((signedTransaction) =>
        connection.sendRawTransaction(signedTransaction.serialize()),
      ),
    )

    onSuccess?.()

    return true
  } catch (error) {
    defaultTxnErrorHandler(error as TxnError)
  }
}
