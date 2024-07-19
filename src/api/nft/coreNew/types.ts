import { z } from 'zod'

import {
  BorrowNftSchema,
  BorrowNftsAndOffersSchema,
  CollectionMetaSchema,
  LenderLoansSchema,
  LoanSchema,
  LoansRequestsSchema,
  MarketPreviewSchema,
  OfferSchema,
  UserOfferSchema,
  WalletLoansAndOffersShema,
} from './schemas'

export type MarketPreview = z.infer<typeof MarketPreviewSchema>

//? Same as BondOfferV3
export type Offer = z.infer<typeof OfferSchema>

export type Loan = z.infer<typeof LoanSchema>

export type WalletLoansAndOffers = z.infer<typeof WalletLoansAndOffersShema>

export type BorrowNft = z.infer<typeof BorrowNftSchema>

export type BorrowNftsAndOffers = z.infer<typeof BorrowNftsAndOffersSchema>

export type CollectionMeta = z.infer<typeof CollectionMetaSchema>

export type LenderLoans = z.infer<typeof LenderLoansSchema>

export type LoansRequests = z.infer<typeof LoansRequestsSchema>

export type UserOffer = z.infer<typeof UserOfferSchema>
