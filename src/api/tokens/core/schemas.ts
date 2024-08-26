import { BondFeatures, BondingCurveType, PairState } from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import {
  BondTradeTransactionSchema,
  FraktBondSchema,
  OfferSchema,
  SerializedBNSchema,
  SerializedPublicKeySchema,
  StringIntSchema,
  StringPublicKeySchema,
} from '@banx/api/shared'

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
  collateralPrice: StringIntSchema,
  totalRepaidAmount: z.number().optional(),
})

export const TokenMarketPreviewSchema = z.object({
  marketPubkey: z.string(),

  collateral: TokenMetaSchema,
  collateralPrice: StringIntSchema,

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

export const BondOfferV3Schema = z.object({
  publicKey: SerializedPublicKeySchema,
  assetReceiver: SerializedPublicKeySchema,
  baseSpotPrice: SerializedBNSchema,
  bidCap: SerializedBNSchema,
  bidSettlement: SerializedBNSchema,
  bondingCurve: z.object({
    delta: SerializedBNSchema,
    bondingType: z.nativeEnum(BondingCurveType),
  }),
  buyOrdersQuantity: SerializedBNSchema,
  concentrationIndex: SerializedBNSchema,
  currentSpotPrice: SerializedBNSchema,
  edgeSettlement: SerializedBNSchema,
  fundsSolOrTokenBalance: SerializedBNSchema,
  hadoMarket: SerializedPublicKeySchema,
  lastTransactedAt: SerializedBNSchema,
  mathCounter: SerializedBNSchema,
  pairState: z.nativeEnum(PairState),
  validation: z.object({
    loanToValueFilter: SerializedBNSchema,
    collateralsPerToken: SerializedBNSchema,
    maxReturnAmountFilter: SerializedBNSchema,
    bondFeatures: z.nativeEnum(BondFeatures),
  }),

  fundsInCurrentEpoch: SerializedBNSchema,
  fundsInNextEpoch: SerializedBNSchema,
  lastCalculatedSlot: SerializedBNSchema,
  lastCalculatedTimestamp: SerializedBNSchema,
  rewardsToHarvest: SerializedBNSchema,
  rewardsToHarvested: SerializedBNSchema,
  loanApr: SerializedBNSchema.default('0'),
})

export const TokenOfferPreviewSchema = z.object({
  publicKey: z.string(),
  bondOffer: BondOfferV3Schema,
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
  collateralPrice: StringIntSchema,
  amountInWallet: z.number(),
})

export const DBOfferSchema = z.object({
  publicKey: StringPublicKeySchema,
  assetReceiver: StringPublicKeySchema,
  baseSpotPrice: z.string(),
  bidCap: z.string(),
  bidSettlement: z.string(),
  bondingCurve: z.object({
    delta: z.string(),
    bondingType: z.nativeEnum(BondingCurveType),
  }),
  buyOrdersQuantity: z.string(),
  concentrationIndex: z.string(),
  currentSpotPrice: z.string(),
  edgeSettlement: z.string(),
  fundsSolOrTokenBalance: z.string(),
  hadoMarket: StringPublicKeySchema,
  lastTransactedAt: z.string(),
  mathCounter: z.string(),
  pairState: z.nativeEnum(PairState),

  validation: z.object({
    loanToValueFilter: z.string(),
    collateralsPerToken: z.string(),
    maxReturnAmountFilter: z.string(),
    bondFeatures: z.nativeEnum(BondFeatures),
  }),

  fundsInCurrentEpoch: z.string(),
  fundsInNextEpoch: z.string(),
  lastCalculatedSlot: z.string(),
  lastCalculatedTimestamp: z.string(),
  rewardsToHarvest: z.string(),
  rewardsToHarvested: z.string(),
  loanApr: z.string(),
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
