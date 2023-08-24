import { captureSentryTxnError } from '@banx/utils'

import { TxnError } from '../types'
import { enqueueTxnErrorSnackbar } from './enqueueTxnErrorSnackbar'

export const defaultTxnErrorHandler = (error: TxnError | Error | unknown) => {
  console.error(error)
  if (error instanceof Error && 'logs' in error && Array.isArray(error.logs)) {
    console.error(error.logs.join('\n'))
  }
  captureSentryTxnError({ error })
  enqueueTxnErrorSnackbar(error)
}
