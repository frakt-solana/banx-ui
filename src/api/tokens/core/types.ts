import { BondTradeTransactionV3, FraktBond } from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { PaginationMeta } from '@banx/api/types'

const TokenMetaSchema = z.object({
  mint: z.string(),
  imageUrl: z.string(),
  ticker: z.string(),
  decimals: z.number(),
  priceUSDC: z.number(),
})

export type TokenMeta = z.infer<typeof TokenMetaSchema>

export type TokenLoan = {
  publicKey: string
  fraktBond: FraktBond
  bondTradeTransaction: BondTradeTransactionV3
  collateral: TokenMeta
  collateralPrice: number
}

export const TokenMarketPreviewSchema = z.object({
  marketPubkey: z.string(),
  tokenType: z.string(),

  collateralTokenPrice: z.number(),
  collateralTokenDecimals: z.number(),
  bestOffer: z.number(),

  activeOffersAmount: z.number(),
  offersTvl: z.number(),
  activeLoansAmount: z.number(),
  loansTvl: z.number(),

  marketApr: z.number(),
  marketApy: z.number(),

  collateralTokenImageUrl: z.string(),
  collateralTokenTicker: z.string(),
})

export type TokenMarketPreview = z.infer<typeof TokenMarketPreviewSchema>

export interface TokenMarketPreviewResponse {
  data: TokenMarketPreview[]
  meta: PaginationMeta
}

export const TokenOfferPreviewSchema = z.object({
  publicKey: z.string(),
  tokenMarketPreview: TokenMarketPreviewSchema,
  tokenOfferPreview: z.object({
    publicKey: z.string(),
    liquidatedLoansAmount: z.number(),
    terminatingLoansAmount: z.number(),
    repaymentCallsAmount: z.number(),
    inLoans: z.number(),
    offerSize: z.number(),
    accruedInterest: z.number(),
  }),
})

export type TokenOfferPreview = z.infer<typeof TokenOfferPreviewSchema>
