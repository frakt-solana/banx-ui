import { SnackbarType } from '@banx/utils'

export enum TxnErrorHumanName {
  TRANSACTION_REJECTED = 'Transaction rejected',
  INSUFFICIENT_LAMPORTS = 'Not enough SOL for transaction',
  TOKEN_IS_LOCKED = 'Token is locked',
}

export type TxnErrorDefinition = {
  humanMessage: TxnErrorHumanName
  keyphrases: Array<string>
  type: SnackbarType
}
