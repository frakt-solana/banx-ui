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
  beforeFirstApprove: () => void //? Triggers before first chunk approve
  beforeApproveEveryChunk: () => void //? Triggers after beforeFirstApprove and before each chunk approve
  pfSuccessAll: (result: SendTxnsResult<TResult>) => void //? Triggers if all chunks were successfully sended
  pfSuccessSome: (result: SendTxnsResult<TResult>) => void //? Triggers if at least one chunk was successfully sended
  pfSuccessEach: (result: SendTxnsResult<TResult>) => void //? Triggers after successfull send of each chunk
  pfError: (error: TxnError) => void //? Triggers on any error
}>

export type SendTxnsResult<TResult> = Array<{
  txnHash: string
  result: TResult | undefined
}>
