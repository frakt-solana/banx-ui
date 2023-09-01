import { enqueueSnackbar } from '@banx/utils'

import { TxnError } from '../types'
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
