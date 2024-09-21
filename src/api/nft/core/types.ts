import { z } from 'zod'

import {
  BondTradeTransactionSchema,
  FraktBondSchema,
  OfferSchema,
  ResponseWithPagination,
} from '../../shared'
import {
  BorrowNftSchema,
  BorrowNftsAndOffersSchema,
  CollectionMetaSchema,
  LenderLoansSchema,
  LoanSchema,
  LoansRequestsSchema,
  MarketPreviewSchema,
  UserOfferSchema,
  WalletLoansAndOffersShema,
} from './schemas'

export type MarketPreview = z.infer<typeof MarketPreviewSchema>

export type MarketPreviewResponse = ResponseWithPagination<MarketPreview[]>

export type FraktBond = z.infer<typeof FraktBondSchema>

export type BondTradeTransaction = z.infer<typeof BondTradeTransactionSchema>

//? Same as BondOfferV3
export type Offer = z.infer<typeof OfferSchema>

export type FetchMarketOffersResponse = ResponseWithPagination<Offer[]>

export type Loan = z.infer<typeof LoanSchema>

export type WalletLoansAndOffers = z.infer<typeof WalletLoansAndOffersShema>

export type WalletLoansAndOffersResponse = ResponseWithPagination<WalletLoansAndOffers>

export type BorrowNft = z.infer<typeof BorrowNftSchema>

export type BorrowNftsAndOffers = z.infer<typeof BorrowNftsAndOffersSchema>

export type BorrowNftsAndOffersResponse = ResponseWithPagination<BorrowNftsAndOffers>

export type CollectionMeta = z.infer<typeof CollectionMetaSchema>

export type LenderLoans = z.infer<typeof LenderLoansSchema>
export type LenderLoansResponse = ResponseWithPagination<LenderLoans[]>

export type LendLoansResponse = ResponseWithPagination<Loan[]>

export type LoansRequests = z.infer<typeof LoansRequestsSchema>

export type AllLoansRequestsResponse = ResponseWithPagination<LoansRequests>

export type UserOffer = z.infer<typeof UserOfferSchema>

export type FetchUserOffersResponse = ResponseWithPagination<UserOffer[]>
