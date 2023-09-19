import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'

export interface PaginationMeta {
  skip: number
  limit: number
  totalCount: number
}

interface SortingOptions {
  sortBy: string
  order: string
}

interface PaginationOptions {
  limit?: number
  skip?: number
  state?: string
}

export type BasePaginationRequest = SortingOptions & PaginationOptions

export interface WalletAndConnection {
  wallet: WalletContextState
  connection: web3.Connection
}
