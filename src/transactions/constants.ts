import { ExecutorOptions } from 'solana-transactions-executor'

import { executorGetPriorityFee } from './functions'
import { TxnErrorDefinition, TxnErrorHumanName } from './types'

export const TXN_ERROR_DEFINITIONS: Array<TxnErrorDefinition> = [
  {
    humanMessage: TxnErrorHumanName.TRANSACTION_REJECTED,
    keyphrases: ['Transaction rejected', 'User rejected the request'],
    type: 'warning',
  },
  {
    humanMessage: TxnErrorHumanName.INSUFFICIENT_LAMPORTS,
    keyphrases: ['insufficient lamports'],
    type: 'error',
  },
  {
    humanMessage: TxnErrorHumanName.TOKEN_IS_LOCKED,
    keyphrases: ['Token is locked'],
    type: 'error',
  },
]

export enum BorrowType {
  StakedBanx = 'StakedBanx',
  CNft = 'CNft',
  Default = 'Default',
}

export enum ListingType {
  CNft = 'CNft',
  Default = 'Default',
}

export const TXN_EXECUTOR_DEFAULT_OPTIONS: ExecutorOptions = {
  sendOptions: {
    maxRetries: 0,
    preflightCommitment: 'processed',
    resendInterval: 1,
    resendTimeout: 60,
    skipPreflight: true,
  },
  confirmOptions: {
    commitment: 'processed',
    confirmationTimeout: 60,
    pollingSignatureInterval: 10,
  },
  transactionOptions: {
    getPriorityFee: executorGetPriorityFee,
  },
  abortOnFirstError: false,
}
