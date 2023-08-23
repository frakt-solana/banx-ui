import { WalletContextState } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'

export interface PaginationMeta {
  skip: number
  limit: number
  totalCount: number
}

export interface WalletAndConnection {
  wallet: WalletContextState
  connection: web3.Connection
}
