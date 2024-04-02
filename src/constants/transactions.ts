import { web3 } from 'fbonds-core'

export const TXN_EXECUTOR_OPTIONS: {
  skipPreflight: boolean
  maxRetries: number
  commitment: web3.Commitment
  preflightCommitment: web3.Commitment
} = {
  skipPreflight: true,
  maxRetries: 1,
  commitment: 'confirmed',
  preflightCommitment: 'confirmed',
}
