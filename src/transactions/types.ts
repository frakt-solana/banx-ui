import { web3 } from 'fbonds-core'

import { SnackbarType } from '@banx/utils'

export type TransactionParams<T> = T extends (arg: infer Arg) => void
  ? Omit<Arg, 'connection' | 'wallet'>
  : never

export enum TxnErrorHumanName {
  TRANSACTION_REJECTED = 'Transaction rejected',
  INSUFFICIENT_LAMPORTS = 'Not enough funds',
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
