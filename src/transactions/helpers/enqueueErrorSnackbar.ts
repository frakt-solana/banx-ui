import { TxnError } from 'solana-transactions-executor'

import { enqueueSnackbar } from '@banx/utils'

import { createErrorLogsString } from '.'
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

  const copyButtonProps = {
    label: 'Copy error logs',
    textToCopy: createErrorLogsString(error, options),
  }

  return enqueueSnackbar({
    message: errorDefinition?.humanMessage ?? 'Something went wrong',
    description: !errorDefinition?.humanMessage ? error.message : undefined,
    copyButtonProps,
    type: errorDefinition?.type ?? 'error',
  })
}
