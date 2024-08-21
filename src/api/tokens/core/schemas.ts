import { z } from 'zod'

import { BondTradeTransactionSchema, FraktBondSchema, OfferSchema } from '@banx/api/shared'

export const TokenMetaSchema = z.object({
  mint: z.string(),
  logoUrl: z.string(),
  ticker: z.string(),
  decimals: z.number(),
  priceUsd: z.number(),
  totalSupply: z.string(),
  fullyDilutedValuation: z.string(),
  fullyDilutedValuationInMillions: z.string(),
})

export const TokenLoanSchema = z.object({
  publicKey: z.string(),
  fraktBond: FraktBondSchema,
  bondTradeTransaction: BondTradeTransactionSchema,
  collateral: TokenMetaSchema,
  collateralPrice: z.number(),
  totalRepaidAmount: z.number().optional(),
})

export const TokenMarketPreviewSchema = z.object({
  marketPubkey: z.string(),

  collateral: TokenMetaSchema,
  collateralPrice: z.number(),

  collectionName: z.string(),

  offersTvl: z.number(),
  loansTvl: z.number(),

  activeOffersAmount: z.number(),
  activeLoansAmount: z.number(),

  bestOffer: z.number(),
  bestLtv: z.number(),

  marketApr: z.number(),
  marketApy: z.number(),
  marketUtilizationRate: z.number().nullable(),

  isHot: z.boolean(),
})

export const TokenOfferPreviewSchema = z.object({
  publicKey: z.string(),
  bondOffer: OfferSchema,
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

export const WalletTokenLoansAndOffersShema = z.object({
  loans: z.array(TokenLoanSchema),
  offers: z.record(OfferSchema.array()),
})

export const TokenLoansRequestsSchema = z.object({
  auctions: TokenLoanSchema.array(),
  listings: TokenLoanSchema.array(),
})

export const CollateralTokenSchema = z.object({
  marketPubkey: z.string(),
  collateral: TokenMetaSchema,
  collateralPrice: z.number(),
  amountInWallet: z.number(),
})

export const BorrowOfferSchema = z.object({
  id: z.string(),
  publicKey: z.string(),
  maxTokenToGet: z.string(), //? BN serialized to decimal string
  collateralsPerToken: z.string(), //? BN serialized to decimal string
  maxCollateralToReceive: z.string(), //? BN serialized to decimal string
  apr: z.string(), //?  BN serialized to decimal string (apr in base points)
  ltv: z.string(), //? BN serialized to decimal string (ltv in base points)
})
