import { fbonds } from 'fbonds-core'
import { ExecutorOptions } from 'solana-transactions-executor'
import { BorshCoder, createAccountDiscriminators } from 'solana-transactions-parser'

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

export const TXN_EXECUTOR_DEFAULT_OPTIONS: ExecutorOptions = {
  sendOptions: {
    maxRetries: 0,
    preflightCommitment: 'processed',
    resendInterval: 1,
    resendTimeout: 60,
    skipPreflight: true,
  },
  confirmOptions: {
    confirmationTimeout: 60,
    pollingSignatureInterval: 2,
  },
  transactionOptions: {
    getPriorityFee: executorGetPriorityFee,
  },
  abortOnFirstError: false,
}

export const BANX_ACCOUNTS_NAMES_AND_DISCRIMINATORS = createAccountDiscriminators(fbonds.IDL)

export const banxCoder = new BorshCoder(fbonds.IDL)
