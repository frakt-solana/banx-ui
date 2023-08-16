import { enqueueSnackbar } from '@banx/utils'

import { TxnError } from '../types'
import { getTxnErrorDefinition } from './getTxnErrorDefinition'

export const enqueueTxnErrorSnackbar = (error: TxnError | Error | unknown) => {
  const errorDefinition = getTxnErrorDefinition(error)
  if (!errorDefinition) return null

  //TODO Add mapping with custom content (copy to clipboard and etc.)

  return enqueueSnackbar({
    message: errorDefinition.humanMessage,
    type: errorDefinition.type,
    persist: true,
  })
}
