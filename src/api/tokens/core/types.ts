import { z } from 'zod'

import { ResponseWithPagination } from '@banx/api/shared'

import {
  BorrowOfferSchema,
  CollateralTokenSchema,
  TokenLoanSchema,
  TokenLoansRequestsSchema,
  TokenMarketPreviewSchema,
  TokenMetaSchema,
  TokenOfferPreviewSchema,
  WalletTokenLoansAndOffersShema,
} from './schemas'

export type TokenMeta = z.infer<typeof TokenMetaSchema>

export type TokenLoan = z.infer<typeof TokenLoanSchema>

export type TokenMarketPreview = z.infer<typeof TokenMarketPreviewSchema>
export type TokenMarketPreviewResponse = ResponseWithPagination<TokenMarketPreview>

export type TokenOfferPreview = z.infer<typeof TokenOfferPreviewSchema>

export type WalletTokenLoansAndOffers = z.infer<typeof WalletTokenLoansAndOffersShema>

export type TokenLoansRequests = z.infer<typeof TokenLoansRequestsSchema>
export type AllTokenLoansRequestsResponse = ResponseWithPagination<TokenLoansRequests>

export type CollateralToken = z.infer<typeof CollateralTokenSchema>

export type BorrowOffer = z.infer<typeof BorrowOfferSchema>
