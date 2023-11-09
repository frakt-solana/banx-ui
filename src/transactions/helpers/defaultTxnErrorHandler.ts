import { TxnError } from 'solana-transactions-executor'

import { captureSentryTxnError } from '@banx/utils'

import { enqueueTxnErrorSnackbar } from './enqueueTxnErrorSnackbar'

type DefaultTxnErrorHandler = (
  error: TxnError,
  options?: Partial<{
    additionalData: unknown
    walletPubkey: string
    transactionName: string
  }>,
) => void

export const defaultTxnErrorHandler: DefaultTxnErrorHandler = (error, options = {}) => {
  const { walletPubkey, additionalData, transactionName } = options

  console.error(error)
  if (error?.logs) {
    console.error(error?.logs?.join('\n'))
  }
  captureSentryTxnError({ error, additionalData, walletPubkey, transactionName })
  enqueueTxnErrorSnackbar(error)
}
