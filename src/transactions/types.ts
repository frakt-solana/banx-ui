export type TransactionParams<T> = T extends (arg: infer Arg) => void
  ? Omit<Arg, 'connection' | 'wallet'>
  : never
