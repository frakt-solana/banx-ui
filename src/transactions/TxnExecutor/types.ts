import { web3 } from 'fbonds-core'

import { WalletAndConnection } from '@banx/types'

import { TxnError } from '../types'

export type TxnData<TResult> = {
  instructions: web3.TransactionInstruction[]
  signers?: web3.Signer[]
  additionalResult?: TResult
  lookupTables: web3.PublicKey[]
}

export type MakeActionFn<TParams, TResult> = (
  params: TParams,
  walletAndConnection: WalletAndConnection,
) => Promise<TxnData<TResult>>

export type ExecutorOptions = {
  commitment: web3.Commitment
  signAllChunks: number
  skipPreflight: boolean
  preflightCommitment: web3.Commitment
  rejectQueueOnFirstPfError: boolean //? Stop sending other txns after first preflight error. Mostly relevant for the ledger
  //TODO: Add webscoket result handling in future
}

export type EventHanlders<TResult> = Partial<{
  beforeFirstApprove: () => void
  beforeApproveEveryChunk: () => void
  pfSuccessAll: (result: SendTxnsResult<TResult>) => void
  pfSuccessSome: (result: SendTxnsResult<TResult>) => void
  pfSuccessEach: (result: SendTxnsResult<TResult>) => void
  pfError: (error: TxnError) => void
}>

export type SendTxnsResult<TResult> = Array<{
  txnHash: string
  result: TResult | undefined
}>
