import {
  BondFeatures,
  BondTradeTransactionV2State,
  BondTradeTransactionV2Type,
  BondingCurveType,
  FraktBondState,
  LendingTokenType,
  PairState,
  RedeemResult,
  RepayDestination,
} from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { NFTSchema, StringIntSchema, StringPublicKeySchema } from '@banx/api/shared'

const MarketMetaSchema = z.object({
  marketApr: StringIntSchema,
  collectionName: z.string(),
  collectionImage: z.string(),
})

export const MarketPreviewSchema = z
  .object({
    marketPubkey: StringPublicKeySchema,
    collectionFloor: StringIntSchema,
    offerTvl: StringIntSchema,
    bestOffer: StringIntSchema,
    bestLtv: StringIntSchema,
    activeBondsAmount: z.number(),
    activeOfferAmount: z.number(),
    loansTvl: StringIntSchema,
    isHot: z.boolean(),
    tensorSlug: z.string().optional(), //TODO Remove when BE fix this
  })
  .merge(MarketMetaSchema)

const BondingCurveSchema = z.object({
  delta: StringIntSchema,
  bondingType: z.nativeEnum(BondingCurveType),
})

const ValidationPairSchema = z.object({
  loanToValueFilter: StringIntSchema,
  collateralsPerToken: StringIntSchema,
  maxReturnAmountFilter: StringIntSchema,
  bondFeatures: z.nativeEnum(BondFeatures),
})

export const OfferSchema = z.object({
  publicKey: StringPublicKeySchema,
  assetReceiver: StringPublicKeySchema,
  baseSpotPrice: StringIntSchema,
  bidCap: StringIntSchema,
  bidSettlement: StringIntSchema,
  bondingCurve: BondingCurveSchema,
  buyOrdersQuantity: StringIntSchema,
  concentrationIndex: StringIntSchema,
  currentSpotPrice: StringIntSchema,
  edgeSettlement: StringIntSchema,
  fundsSolOrTokenBalance: StringIntSchema,
  hadoMarket: StringPublicKeySchema,
  lastTransactedAt: StringIntSchema,
  mathCounter: StringIntSchema,
  pairState: z.nativeEnum(PairState),
  validation: ValidationPairSchema,

  fundsInCurrentEpoch: StringIntSchema,
  fundsInNextEpoch: StringIntSchema,
  lastCalculatedSlot: StringIntSchema,
  lastCalculatedTimestamp: StringIntSchema,
  rewardsToHarvest: StringIntSchema,
  rewardsToHarvested: StringIntSchema,
  loanApr: StringIntSchema,
})

export const BondTradeTransactionSchema = z.object({
  publicKey: StringPublicKeySchema,
  amountOfBonds: StringIntSchema,
  bondOffer: StringPublicKeySchema,
  bondTradeTransactionState: z.nativeEnum(BondTradeTransactionV2State),
  bondTradeTransactionType: z.nativeEnum(BondTradeTransactionV2Type),
  borrowerFullRepaidAmount: StringIntSchema,
  borrowerOriginalLent: StringIntSchema,
  repaymentCallAmount: StringIntSchema, //? Stores value that borrower needs to pay (NOT value that lender receives)
  currentRemainingLent: StringIntSchema,
  fbondTokenMint: StringPublicKeySchema,
  feeAmount: StringIntSchema,
  interestSnapshot: StringIntSchema,
  isDirectSell: z.boolean(),
  lenderFullRepaidAmount: StringIntSchema,
  lenderOriginalLent: StringIntSchema,
  lendingToken: z.nativeEnum(LendingTokenType),
  partialRepaySnapshot: StringIntSchema,
  redeemResult: z.nativeEnum(RedeemResult),
  redeemedAt: StringIntSchema,
  repayDestination: z.nativeEnum(RepayDestination),
  seller: StringPublicKeySchema,
  solAmount: StringIntSchema,
  soldAt: StringIntSchema,
  terminationFreeze: StringIntSchema,
  terminationStartedAt: StringIntSchema,
  user: StringPublicKeySchema,
})

export const FraktBondSchema = z.object({
  publicKey: StringPublicKeySchema,
  activatedAt: StringIntSchema,
  actualReturnedAmount: StringIntSchema,
  amountToReturn: StringIntSchema,
  banxStake: StringPublicKeySchema,
  bondTradeTransactionsCounter: z.number(),
  borrowedAmount: StringIntSchema,
  currentPerpetualBorrowed: StringIntSchema,
  fbondIssuer: StringPublicKeySchema,
  fbondTokenMint: StringPublicKeySchema,
  fbondTokenSupply: StringIntSchema,
  fraktBondState: z.nativeEnum(FraktBondState),
  fraktMarket: StringPublicKeySchema,
  lastTransactedAt: StringIntSchema,
  liquidatingAt: StringIntSchema,
  refinanceAuctionStartedAt: StringIntSchema,
  repaidOrLiquidatedAt: StringIntSchema,
  terminatedCounter: z.number(),
  hadoMarket: StringPublicKeySchema.optional(), //? Why optional
})

export const LoanSchema = z.object({
  publicKey: StringPublicKeySchema,
  fraktBond: FraktBondSchema,
  bondTradeTransaction: BondTradeTransactionSchema,
  nft: NFTSchema,
  totalRepaidAmount: StringIntSchema.optional(), //? exist only in fetchLenderLoansAndOffers request
  accruedInterest: StringIntSchema.optional(),
  offerWasClosed: z.boolean().optional(), //? What for?
})

export const WalletLoansAndOffersShema = z.object({
  nfts: LoanSchema.array(),
  offers: z.record(OfferSchema.array()),
})

export const BorrowNftSchema = z.object({
  mint: StringPublicKeySchema,
  loan: z.object({
    marketPubkey: StringPublicKeySchema,
    fraktMarket: StringPublicKeySchema,
    marketApr: StringIntSchema,
    banxStake: StringPublicKeySchema.optional(), //? exists when nft is banx and it's staked
  }),
  nft: NFTSchema,
})

export const BorrowNftsAndOffersSchema = z.object({
  nfts: BorrowNftSchema.array(),
  offers: z.record(OfferSchema.array()),
})

export const CollectionMetaSchema = z.object({
  collectionFloor: StringIntSchema,
  collectionName: z.string(),
  collectionImage: z.string(),
})

export const LenderLoansSchema = z.object({
  offer: OfferSchema,
  loans: LoanSchema.array(),
})

export const LoansRequestsSchema = z.object({
  auctions: LoanSchema.array(),
  listings: LoanSchema.array(),
})

export const UserOfferSchema = z.object({
  offer: OfferSchema,
  collectionMeta: CollectionMetaSchema,
})
