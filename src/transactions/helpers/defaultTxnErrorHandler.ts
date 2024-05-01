import { captureSentryTxnError } from '@banx/utils'

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
    enqueueTxnErrorSnackbar(error)
  }

  //? If error has logs --> print them
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((error as any)?.logs) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error((error as any)?.logs?.join('\n'))
  }

  const { walletPubkey, additionalData, transactionName } = options
  captureSentryTxnError({ error, additionalData, walletPubkey, transactionName })
}
