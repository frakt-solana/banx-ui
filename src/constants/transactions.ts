import { web3 } from 'fbonds-core'

export const TXN_EXECUTOR_CONFIRM_OPTIONS: {
  skipPreflight: boolean
  maxRetries: number
  commitment: web3.Commitment
  preflightCommitment: web3.Commitment
} = {
  skipPreflight: false,
  maxRetries: 1,
  commitment: 'confirmed',
  preflightCommitment: 'confirmed',
}
