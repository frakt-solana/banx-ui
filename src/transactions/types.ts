export type CommitmentType = 'processed' | 'confirmed' | 'finalized'

export type WalletAndConnect = 'connection' | 'wallet'

export type TransactionParams<T> = T extends (arg: infer Arg) => void
  ? Omit<Arg, WalletAndConnect>
  : never
