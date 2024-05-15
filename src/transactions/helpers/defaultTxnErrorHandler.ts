import { captureSentryTxnError } from '@banx/utils'

import { errorLogsToString } from '.'
import { enqueueTxnErrorSnackbar } from './enqueueErrorSnackbar'

type DefaultTxnErrorHandler = (
  error: unknown,
  options?: Partial<{
    additionalData: unknown
    walletPubkey: string
    transactionName: string
  }>,
) => void

export const defaultTxnErrorHandler: DefaultTxnErrorHandler = (error, options = {}) => {
  console.error(error)

  if (error instanceof Error) {
    enqueueTxnErrorSnackbar(error, options)
    //? If error has logs --> print them
    console.error(errorLogsToString(error))
  }

  const { walletPubkey, additionalData, transactionName } = options
  captureSentryTxnError({ error, additionalData, walletPubkey, transactionName })
}
