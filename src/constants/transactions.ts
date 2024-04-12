import { ExecutorOptions } from 'solana-transactions-executor'

const CONFIRMATION_TIMEOUT = 60

export const TXN_EXECUTOR_BASE_OPTIONS: ExecutorOptions = {
  sendOptions: {
    maxRetries: 0,
    skipPreflight: true,
    preflightCommitment: 'processed',
    resendInterval: 1,
    resendTimeout: CONFIRMATION_TIMEOUT,
  },
  confirmOptions: {
    commitment: 'processed',
    pollingSignatureInterval: 5,
    confirmationTimeout: CONFIRMATION_TIMEOUT,
  },
}
