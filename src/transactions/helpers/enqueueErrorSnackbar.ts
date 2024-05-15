import { TxnError } from 'solana-transactions-executor'

import { enqueueSnackbar } from '@banx/utils'

import { createErrorLogsString } from '.'
import { TxnErrorHumanName } from '../types'
import { getTxnErrorDefinition } from './getTxnErrorDefinition'

type EnqueueTxnErrorSnackbar = (
  error: TxnError,
  options?: Partial<{
    additionalData: unknown
    walletPubkey: string
    transactionName: string
  }>,
) => ReturnType<typeof enqueueSnackbar>
export const enqueueTxnErrorSnackbar: EnqueueTxnErrorSnackbar = (error, options) => {
  const errorDefinition = getTxnErrorDefinition(error)

  const isTransactionRejectedByUser =
    errorDefinition?.humanMessage === TxnErrorHumanName.TRANSACTION_REJECTED

  const copyButtonProps = !isTransactionRejectedByUser
    ? {
        label: 'Copy error logs',
        textToCopy: createErrorLogsString(error, options),
      }
    : undefined

  return enqueueSnackbar({
    message: errorDefinition?.humanMessage ?? 'Something went wrong',
    description: !errorDefinition?.humanMessage ? error.message : undefined,
    copyButtonProps,
    type: errorDefinition?.type ?? 'error',
  })
}
