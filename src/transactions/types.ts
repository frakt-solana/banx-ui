import { NotificationTypes } from '@banx/utils'

export interface TxnError extends Error {
  logs?: Array<string>
}

export type TransactionParams<T> = T extends (arg: infer Arg) => void
  ? Omit<Arg, 'connection' | 'wallet'>
  : never

export enum TxnErrorHumanName {
  TRANSACTION_REJECTED = 'Transaction rejected',
  INSUFFICIENT_LAMPORTS = 'No money, bro',
}

export interface TxnErrorDefinition {
  humanMessage: TxnErrorHumanName
  keyphrases: Array<string>
  type: NotificationTypes
}
