import { TxnError } from 'solana-transactions-executor'

export * from './enqueueErrorSnackbar'
export * from './getTxnErrorDefinition'
export * from './defaultTxnErrorHandler'

export const errorLogsToString = (error: unknown) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (error as any)?.logs?.join('\n') ?? ''
}

type CreateErrorLogsString = (
  error: TxnError,
  options?: Partial<{
    additionalData: unknown
    walletPubkey: string
    transactionName: string
  }>,
) => string
export const createErrorLogsString: CreateErrorLogsString = (error, options) => {
  return JSON.stringify(
    {
      transaction: options?.transactionName ?? '',
      wallet: options?.walletPubkey ?? '',
      message: error?.message,
      logs: error?.logs ?? [],
      additional: options?.additionalData,
    },
    null,
    2,
  )
}

//? Placeholder for sendTxn callback in SDK methods
export const sendTxnPlaceHolder = async (): Promise<void> => await Promise.resolve()
