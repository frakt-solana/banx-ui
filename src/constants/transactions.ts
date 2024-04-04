import { web3 } from 'fbonds-core'

export const TXN_EXECUTOR_CONFIRM_OPTIONS: {
  skipPreflight: boolean
  maxRetries: number | undefined
  commitment: web3.Commitment
  preflightCommitment: web3.Commitment
} = {
  skipPreflight: true,
  maxRetries: 0,
  commitment: 'processed',
  preflightCommitment: 'processed',
}
