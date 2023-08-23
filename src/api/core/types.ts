import { z } from 'zod'

import { PaginationMeta } from '@banx/types'

export const MarketPreviewSchema = z.object({
  marketPubkey: z.string(),
  collectionName: z.string(),
  collectionImage: z.string(),
  collectionFloor: z.number(),
  offerTVL: z.number(),
  bestOffer: z.number(), //? lamports
  bestLTV: z.number(),
  activeBondsAmount: z.number(),
  activeOfferAmount: z.number(),
  marketAPR: z.number(),
  loansTVL: z.number(),
})

export type MarketPreview = z.infer<typeof MarketPreviewSchema>

export interface MarketPreviewResponse {
  data: MarketPreview[]
  meta: PaginationMeta
}

const FraktMarketSchema = z.object({
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
  fraktMarket: FraktMarketSchema,
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
  loanToValueFilter: z.number() || z.null(),
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
  currentSpotPrice: z.number(),
  edgeSettlement: z.number(),
  fundsSolOrTokenBalance: z.number(),
  hadoMarket: z.string(),
  lastTransactedAt: z.number(),
  mathCounter: z.number(),
  pairState: z.string(),
  validation: ValidationPairSchema,
})

const UserPairSchema = PairSchema.extend({
  collectionName: z.string(),
  collectionImage: z.string(),
})

export type Offer = z.infer<typeof PairSchema>
export type UserOffer = z.infer<typeof UserPairSchema>

export interface FetchMarketOffersResponse {
  data: Offer[]
  meta: PaginationMeta
}

const NFTSchema = z.object({
  mint: z.string(),
  meta: z.object({
    imageUrl: z.string(),
    name: z.string(),
    collectionName: z.string(),
    collectionImage: z.string(),
  }),
  collectionFloor: z.number(),
})

const BondTradeTransactionSchema = z.object({
  bondTradeTransactionState: z.string(),
  bondOffer: z.string(),
  user: z.string(),
  amountOfBonds: z.number(),
  solAmount: z.number(),
  feeAmount: z.number(),
  bondTradeTransactionType: z.string(),
  fbondTokenMint: z.string(),
  soldAt: z.number(),
  redeemedAt: z.number(),
  redeemResult: z.string(),
  seller: z.string(),
  isDirectSell: z.boolean(),
  publicKey: z.string(),
})

const FraktBondSchema = z.object({
  fraktBondState: z.string(),
  bondTradeTransactionsCounter: z.number(),
  borrowedAmount: z.number(),
  banxStake: z.string(),
  fraktMarket: z.string(),
  amountToReturn: z.number(),
  actualReturnedAmount: z.number(),
  terminatedCounter: z.number(),
  fbondTokenMint: z.string(),
  fbondTokenSupply: z.number(),
  activatedAt: z.number(),
  liquidatingAt: z.number(),
  fbondIssuer: z.string(),
  repaidOrLiquidatedAt: z.number(),
  currentPerpetualBorrowed: z.number(),
  lastTransactedAt: z.number(),
  refinanceAuctionStartedAt: z.number(),
  publicKey: z.string(),
})

export const LoanSchema = z.object({
  publicKey: z.string(),
  fraktBond: FraktBondSchema,
  bondTradeTransaction: BondTradeTransactionSchema,
  nft: NFTSchema,
})

export type Loan = z.infer<typeof LoanSchema>

export interface WalletLoansResponse {
  data: Loan[]
  meta: PaginationMeta
}

const BorrowNftSchema = z.object({
  mint: z.string(),
  loan: z.object({
    marketPubkey: z.string(),
    fraktMarket: z.string(),
    marketApr: z.number(),
    banxStake: z.string().optional(),
  }),
  nft: NFTSchema,
})

export type BorrowNft = z.infer<typeof BorrowNftSchema>

export const BorrowNftsAndOffersSchema = z.object({
  nfts: BorrowNftSchema.array(),
  offers: z.record(PairSchema.array()),
})

export type BorrowNftsAndOffers = z.infer<typeof BorrowNftsAndOffersSchema>

export interface BorrowNftsAndOffersResponse {
  data: BorrowNftsAndOffers
  meta: PaginationMeta
}

export const LendNftsAndOffersSchema = z.object({
  nfts: LoanSchema.array(),
  offers: z.record(PairSchema.array()),
})

export type LendLoansAndOffers = z.infer<typeof LendNftsAndOffersSchema>

export interface LendLoansAndOffersResponse {
  data: LendLoansAndOffers
  meta: PaginationMeta
}
