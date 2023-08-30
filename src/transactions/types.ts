import { web3 } from 'fbonds-core'

import { SnackbarType } from '@banx/utils'

export interface TxnError extends Error {
  logs?: Array<string>
}

export type TransactionParams<T> = T extends (arg: infer Arg) => void
  ? Omit<Arg, 'connection' | 'wallet'>
  : never

export enum TxnErrorHumanName {
  TRANSACTION_REJECTED = 'Transaction rejected',
  INSUFFICIENT_LAMPORTS = 'No money, bro',
  TOKEN_IS_LOCKED = 'Token is locked',
}

export interface TxnErrorDefinition {
  humanMessage: TxnErrorHumanName
  keyphrases: Array<string>
  type: SnackbarType
}

export interface TxnsAndSigners {
  transaction: web3.Transaction
  signers?: web3.Signer[]
}
