import { core } from '@banx/api/nft'

export interface TableNftData {
  mint: string
  nft: core.BorrowNft
  loanValue: number
  selected: boolean
  interest: number //? 1 week interest
}

export interface OfferWithLoanValue {
  offer: core.Offer
  loanValue: number
}
