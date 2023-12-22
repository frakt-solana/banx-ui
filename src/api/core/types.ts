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

export const NFTSchema = z.object({
  mint: z.string(),
  meta: z.object({
    imageUrl: z.string(),
    name: z.string(),
    collectionName: z.string(),
    collectionImage: z.string(),
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
  hadoMarket: z.string().optional(),
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

export const LendLoansAndOffersSchema = z.object({
  offer: PairSchema,
  loans: LoanSchema.array(),
  collectionMeta: CollectionMetaSchema,
})
export type LendLoansAndOffers = z.infer<typeof LendLoansAndOffersSchema>
export interface LendLoansAndOffersResponse {
  data: LendLoansAndOffers[]
  meta: PaginationMeta
}
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

export interface AuctionsLoansResponse {
  data: Loan[]
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
