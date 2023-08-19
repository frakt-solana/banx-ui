import { BorrowNft } from '@banx/api/core'

export interface TableNftData {
  mint: string
  nft: BorrowNft
  loanValue: number
  selected: boolean
  // fee: number
  // apr: number
}

export enum SortField {
  BORROW = 'Borrow',
  NAME = 'Name',
}
