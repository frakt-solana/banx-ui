import { ExecutorOptions } from 'solana-transactions-executor'

export const TXN_EXECUTOR_CONFIRM_OPTIONS: ExecutorOptions['confirmOptions'] = {
  skipPreflight: true,
  maxRetries: 0,
  commitment: 'processed',
  preflightCommitment: 'processed',
  confirmationTimeout: 60,
}
