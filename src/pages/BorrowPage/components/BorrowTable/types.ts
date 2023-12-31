import { BorrowNft, Offer } from '@banx/api/core'

export interface TableNftData {
  mint: string
  nft: BorrowNft
  loanValue: number
  selected: boolean
  interest: number //? 1 week interest
}

export enum SortField {
  BORROW = 'loanValue',
  FLOOR = 'floorPrice',
  FEE = 'weeklyFee',
}

export interface OfferWithLoanValue {
  offer: Offer
  loanValue: number
}
