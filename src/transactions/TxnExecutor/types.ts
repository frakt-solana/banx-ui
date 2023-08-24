import { web3 } from 'fbonds-core'

import { WalletAndConnection } from '@banx/types'

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventHandler = (params?: any) => void

export type EventHanlders = Record<HandlerType, EventHandler>

export type HandlerType =
  | 'beforeFirstApprove'
  | 'pfSuccessAll'
  | 'pfSuccessAny'
  | 'pfSuccessEvery'
  | 'pfError'
  | 'beforeApproveEveryChunk'
