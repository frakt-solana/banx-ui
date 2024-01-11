import { TxnError } from 'solana-transactions-executor'

import { enqueueSnackbar } from '@banx/utils'

import { getTxnErrorDefinition } from './getTxnErrorDefinition'

export const enqueueTxnErrorSnackbar = (error: TxnError) => {
  const errorDefinition = getTxnErrorDefinition(error)

  const copyButtonProps = error?.logs
    ? {
        label: 'Copy logs',
        textToCopy: `${error.message}\n${error?.logs?.join('\n')}`,
      }
    : undefined

  return enqueueSnackbar({
    message: errorDefinition?.humanMessage ?? 'Something went wrong',
    description: !errorDefinition?.humanMessage ? error.message : undefined,
    copyButtonProps,
    type: errorDefinition?.type ?? 'error',
  })
}

export const enqueueUnknownErrorSnackbar = (error: Error) => {
  const errorDefinition = getTxnErrorDefinition(error)

  return enqueueSnackbar({
    message: errorDefinition?.humanMessage ?? 'Something went wrong',
    description: !errorDefinition?.humanMessage ? error.message : undefined,
    type: errorDefinition?.type ?? 'error',
  })
}
