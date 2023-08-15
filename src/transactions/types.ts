export interface TxnError extends Error {
  logs?: Array<string>
}

export type TransactionParams<T> = T extends (arg: infer Arg) => void
  ? Omit<Arg, 'connection' | 'wallet'>
  : never
