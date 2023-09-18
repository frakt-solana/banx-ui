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
    offerTVL: z.number(),
    bestOffer: z.number(), //? lamports
    bestLTV: z.number(),
    activeBondsAmount: z.number(),
    activeOfferAmount: z.number(),
    loansTVL: z.number(),
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
  loanToValueFilter: z.number().optional(),
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

export const UserPairSchema = PairSchema.merge(MarketMetaSchema)

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
  compression: z
    .object({
      dataHash: z.string(),
      creatorHash: z.string(),
      leafId: z.number(),
      tree: z.string(),
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

export interface AuctionsLoansResponse {
  data: Loan[]
  meta: PaginationMeta
}

export const LenderActivitySchema = z.object({
  status: z.string(),
  publicKey: z.string(),
  apr: z.number(),
  duration: z.number(),
  interest: z.number(),
  lent: z.number(),
  nftImageUrl: z.string(),
  nftMint: z.string(),
  nftName: z.string(),
  received: z.number(),
  timestamp: z.number(),
  user: z.string(),
  nft: NFTSchema,
})

export type LenderActivity = z.infer<typeof LenderActivitySchema>

export interface LenderActivityResponse {
  data: LenderActivity[]
  meta: PaginationMeta
}

export const BorrowerActivitySchema = z.object({
  status: z.string(),
  publicKey: z.string(),
  apr: z.number(),
  borrowed: z.number(),
  duration: z.number(),
  interest: z.number(),
  nftImageUrl: z.string(),
  nftMint: z.string(),
  nftName: z.string(),
  repaid: z.number(),
  timestamp: z.number(),
  user: z.string(),
  nft: NFTSchema,
})

export type BorrowerActivity = z.infer<typeof BorrowerActivitySchema>

export interface BorrowedActivityResponse {
  data: BorrowerActivity[]
  meta: PaginationMeta
}
