import {
  BondTradeTransactionV2State,
  BondTradeTransactionV2Type,
  FraktBondState,
  LendingTokenType,
  RedeemResult,
  RepayDestination,
} from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { PaginationMeta } from '@banx/types'

const MarketMetaSchema = z.object({
  marketApr: z.number(),
  collectionName: z.string(),
  collectionImage: z.string(),
})

export const MarketPreviewSchema = z
  .object({
    marketPubkey: z.string(),
    collectionFloor: z.number(),
    offerTvl: z.number(),
    bestOffer: z.number(), //? lamports
    bestLtv: z.number(),
    activeBondsAmount: z.number(),
    activeOfferAmount: z.number(),
    loansTvl: z.number(),
    isHot: z.boolean(),
    tensorSlug: z.string(),
  })
  .merge(MarketMetaSchema)

export type MarketPreview = z.infer<typeof MarketPreviewSchema>

export interface MarketPreviewResponse {
  data: MarketPreview[]
  meta: PaginationMeta
}

const BondingCurveSchema = z.object({
  delta: z.number(),
  bondingType: z.string(),
})

const ValidationPairSchema = z.object({
  loanToValueFilter: z.number(),
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
  marketApr: z.number().optional(), //TODO Make marketApr required
  mathCounter: z.number(),
  pairState: z.string(),
  validation: ValidationPairSchema,
})

export type Offer = z.infer<typeof PairSchema>

export interface FetchMarketOffersResponse {
  data: Offer[]
  meta: PaginationMeta
}

export enum RarityTier {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Epic = 'epic',
  Legendary = 'legendary',
  Mythic = 'mythic',
}

const RaritySchema = z.object({
  tier: z.nativeEnum(RarityTier),
  rank: z.number(),
})

export type Rarity = z.infer<typeof RaritySchema>

export const NFTSchema = z.object({
  mint: z.string(),
  meta: z.object({
    imageUrl: z.string(),
    name: z.string(),
    collectionName: z.string(),
    collectionImage: z.string(),
    tensorSlug: z.string(),
    partnerPoints: z.number().optional(),
    playerPoints: z.number().optional(),
  }),
  compression: z
    .object({
      dataHash: z.string(),
      creatorHash: z.string(),
      leafId: z.number(),
      tree: z.string(),
      whitelistEntry: z.string(),
    })
    .optional(),
  collectionFloor: z.number(),
  rarity: RaritySchema.optional(),
})

const BondTradeTransactionSchema = z.object({
  publicKey: z.string(),
  amountOfBonds: z.number(),
  bondOffer: z.string(),
  bondTradeTransactionState: z.nativeEnum(BondTradeTransactionV2State),
  bondTradeTransactionType: z.nativeEnum(BondTradeTransactionV2Type),
  borrowerFullRepaidAmount: z.number(),
  borrowerOriginalLent: z.number(),
  repaymentCallAmount: z.number(), //? Stores value that borrower needs to pay (NOT value that lender receives)
  currentRemainingLent: z.number(),
  fbondTokenMint: z.string(),
  feeAmount: z.number(),
  interestSnapshot: z.number(),
  isDirectSell: z.boolean(),
  lenderFullRepaidAmount: z.number(),
  lenderOriginalLent: z.number(),
  lendingToken: z.nativeEnum(LendingTokenType),
  partialRepaySnapshot: z.number(),
  redeemResult: z.nativeEnum(RedeemResult),
  redeemedAt: z.number(),
  repayDestination: z.nativeEnum(RepayDestination),
  seller: z.string(),
  solAmount: z.number(),
  soldAt: z.number(),
  terminationFreeze: z.number(),
  terminationStartedAt: z.number(),
  user: z.string(),
})

const FraktBondSchema = z.object({
  publicKey: z.string(),
  activatedAt: z.number(),
  actualReturnedAmount: z.number(),
  amountToReturn: z.number(),
  banxStake: z.string(),
  bondTradeTransactionsCounter: z.number(),
  borrowedAmount: z.number(),
  currentPerpetualBorrowed: z.number(),
  fbondIssuer: z.string(),
  fbondTokenMint: z.string(),
  fbondTokenSupply: z.number(),
  fraktBondState: z.nativeEnum(FraktBondState),
  fraktMarket: z.string(),
  lastTransactedAt: z.number(),
  liquidatingAt: z.number(),
  refinanceAuctionStartedAt: z.number(),
  repaidOrLiquidatedAt: z.number(),
  terminatedCounter: z.number(),
  hadoMarket: z.string().optional(),
})

export const LoanSchema = z.object({
  publicKey: z.string(),
  fraktBond: FraktBondSchema,
  bondTradeTransaction: BondTradeTransactionSchema,
  nft: NFTSchema,
  totalRepaidAmount: z.number().optional(), //? exist only in fetchLenderLoansAndOffers request
  accruedInterest: z.number().optional(),
})

export type Loan = z.infer<typeof LoanSchema>

export const WalletLoansAndOffersShema = z.object({
  nfts: LoanSchema.array(),
  offers: z.record(PairSchema.array()),
})

export type WalletLoansAndOffers = z.infer<typeof WalletLoansAndOffersShema>

export interface WalletLoansAndOffersResponse {
  data: WalletLoansAndOffers
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

export const CollectionMetaSchema = z.object({
  collectionFloor: z.number(),
  collectionName: z.string(),
  collectionImage: z.string(),
})

export type CollectionMeta = z.infer<typeof CollectionMetaSchema>

export const LenderLoansSchema = z.object({
  offer: PairSchema,
  loans: LoanSchema.array(),
})
export type LenderLoans = z.infer<typeof LenderLoansSchema>
export interface LenderLoansResponse {
  data: LenderLoans[]
  meta: PaginationMeta
}

export interface LendLoansResponse {
  data: Loan[]
  meta: PaginationMeta
}

export const LoansRequestsSchema = z.object({
  auctions: LoanSchema.array(),
  listings: LoanSchema.array(),
})

export type LoansRequests = z.infer<typeof LoansRequestsSchema>

export interface AllLoansRequestsResponse {
  data: LoansRequests
  meta: PaginationMeta
}

export const UserOfferSchema = z.object({
  offer: PairSchema,
  collectionMeta: CollectionMetaSchema,
})
export type UserOffer = z.infer<typeof UserOfferSchema>

export interface FetchUserOffersResponse {
  data: UserOffer[]
  meta: PaginationMeta
}
