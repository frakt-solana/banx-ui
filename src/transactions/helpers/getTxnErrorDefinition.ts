import { TxnError } from 'solana-transactions-executor'

import { TXN_ERROR_DEFINITIONS } from '../constants'
import { TxnErrorDefinition } from '../types'

type GetTxnErrorDefinition = (error: TxnError | Error | unknown) => TxnErrorDefinition | null
export const getTxnErrorDefinition: GetTxnErrorDefinition = (error) => {
  if (error instanceof Error && 'logs' in error && Array.isArray(error.logs)) {
    const logs = error.logs.join('').concat(error.message)
    return getTxnErrorDefinitionFromLogs(logs)
  }

  if (error instanceof Error) {
    return getTxnErrorDefinitionFromLogs(error.message)
  }

  return null
}

const getTxnErrorDefinitionFromLogs = (logs: string): TxnErrorDefinition | null => {
  const errorDefinition = TXN_ERROR_DEFINITIONS.find(({ keyphrases }) => {
    return keyphrases.some((k) => logs.includes(k))
  })

  return errorDefinition || null
}
