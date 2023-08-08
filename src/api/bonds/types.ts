import { z } from 'zod'

import { Meta } from '@banx/types'

export const MarketPreviewSchema = z.object({
  marketPubkey: z.string(),
  collectionName: z.string(),
  collectionImage: z.string(),
  collectionFloor: z.number(),
  offerTVL: z.number(),
  apy: z.number(), //? %
  bestOffer: z.number(), //? lamports
  bestLTV: z.number(),
  activeBondsAmount: z.number(),
  activeOfferAmount: z.number(),
  fee: z.number(),
  loansTVL: z.number(),
})

export type MarketPreview = z.infer<typeof MarketPreviewSchema>

export interface MarketPreviewResponse {
  data: MarketPreview[]
  meta: Meta
}

const fraktMarketSchema = z.object({
  publicKey: z.string(),
  authority: z.string(),
  collectionSlug: z.string(),
  createdAt: z.string(),
  isRemoved: z.boolean(),
  state: z.string(),
  updatedAt: z.string(),
  whitelistQuantity: z.number(),
})

const WhitelistEntrySchema = z.object({
  publicKey: z.string(),
  createdAt: z.string(),
  fraktMarket: z.string(),
  isDeployed: z.boolean(),
  isRemoved: z.boolean(),
  updatedAt: z.string(),
  whitelistType: z.string(),
  whitelistedAddress: z.string(),
})

const OracleFloorSchema = z.object({
  publicKey: z.string(),
  createdAt: z.string(),
  floor: z.number(),
  fraktMarket: z.string(),
  lastUpdatedAt: z.number(),
  oracleAuthority: z.string(),
  oracleInfo: z.string(),
  updatedAt: z.string(),
})

export const MarketSchema = z.object({
  marketPubkey: z.string(),
  collectionName: z.string(),
  collectionImage: z.string(),
  createdAt: z.string(),
  isPrivate: z.boolean(),
  isRemoved: z.boolean(),
  marketAuthority: z.string(),
  marketState: z.string(),
  marketTrustType: z.string(),
  minBidCap: z.number(),
  minMarketFee: z.number(),
  pairTokenMint: z.string(),
  pairTokenType: z.string(),
  pairValidationType: z.string(),
  updatedAt: z.string(),
  validationAdapterProgram: z.string(),
  collectionSlug: z.string(),
  imageUrl: z.string(),
  name: z.string(),
  fraktMarket: fraktMarketSchema,
  whitelistType: z.string(),
  whitelistedAddress: z.string(),
  bestOffer: z.number(),
  whitelistEntry: WhitelistEntrySchema,
  oracleFloor: OracleFloorSchema,
})

export type Market = z.infer<typeof MarketSchema>

const BondingCurveSchema = z.object({
  delta: z.number(),
  bondingType: z.string(),
})

const ValidationPairSchema = z.object({
  loanToValueFilter: z.string() || z.null(),
  durationFilter: z.number(),
  maxReturnAmountFilter: z.number(),
  bondFeatures: z.string(),
})

export const PairSchema = z.object({
  publicKey: z.string(),
  assetReceiver: z.string(),
  baseSpotPrice: z.number(),
  bidCap: z.number(),
  bidSettlement: z.number(),
  bondingCurve: BondingCurveSchema,
  buyOrdersQuantity: z.number(),
  concentrationIndex: z.number(),
  createdAt: z.string(),
  currentSpotPrice: z.number(),
  edgeSettlement: z.number(),
  fundsSolOrTokenBalance: z.number(),
  hadoMarket: z.string(),
  isRemoved: z.boolean(),
  lastTransactedAt: z.number(),
  mathCounter: z.number(),
  pairState: z.string(),
  updatedAt: z.string(),
  validation: ValidationPairSchema,
})

export type Pair = z.infer<typeof PairSchema>
