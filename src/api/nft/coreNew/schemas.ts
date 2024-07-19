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

import { NFTSchemaNew, SerializedBNSchema, SerializedPublicKeySchema } from '@banx/api/shared'

const MarketMetaSchema = z.object({
  marketApr: SerializedBNSchema, //? or number?
  collectionName: z.string(),
  collectionImage: z.string(),
})

export const MarketPreviewSchema = z
  .object({
    marketPubkey: SerializedPublicKeySchema,
    collectionFloor: SerializedBNSchema, //? or number?
    offerTvl: SerializedBNSchema,
    bestOffer: SerializedBNSchema,
    bestLtv: SerializedBNSchema, //? or number?
    activeBondsAmount: z.number(),
    activeOfferAmount: z.number(),
    loansTvl: SerializedBNSchema,
    isHot: z.boolean(),
    tensorSlug: z.string(),
  })
  .merge(MarketMetaSchema)

const BondingCurveSchema = z.object({
  delta: SerializedBNSchema,
  bondingType: z.nativeEnum(BondingCurveType),
})

const ValidationPairSchema = z.object({
  loanToValueFilter: SerializedBNSchema,
  collateralsPerToken: SerializedBNSchema,
  maxReturnAmountFilter: SerializedBNSchema,
  bondFeatures: z.nativeEnum(BondFeatures),
})

export const OfferSchema = z.object({
  publicKey: SerializedPublicKeySchema,
  assetReceiver: SerializedPublicKeySchema,
  baseSpotPrice: SerializedBNSchema,
  bidCap: SerializedBNSchema,
  bidSettlement: SerializedBNSchema,
  bondingCurve: BondingCurveSchema,
  buyOrdersQuantity: SerializedBNSchema,
  concentrationIndex: SerializedBNSchema,
  currentSpotPrice: SerializedBNSchema,
  edgeSettlement: SerializedBNSchema,
  fundsSolOrTokenBalance: SerializedBNSchema,
  hadoMarket: SerializedPublicKeySchema,
  lastTransactedAt: SerializedBNSchema,
  mathCounter: SerializedBNSchema,
  pairState: z.nativeEnum(PairState),
  validation: ValidationPairSchema,

  fundsInCurrentEpoch: SerializedBNSchema,
  fundsInNextEpoch: SerializedBNSchema,
  lastCalculatedSlot: SerializedBNSchema,
  lastCalculatedTimestamp: SerializedBNSchema,
  rewardsToHarvest: SerializedBNSchema,
  rewardsToHarvested: SerializedBNSchema,
})

const BondTradeTransactionSchema = z.object({
  publicKey: SerializedPublicKeySchema,
  amountOfBonds: SerializedBNSchema,
  bondOffer: SerializedPublicKeySchema,
  bondTradeTransactionState: z.nativeEnum(BondTradeTransactionV2State),
  bondTradeTransactionType: z.nativeEnum(BondTradeTransactionV2Type),
  borrowerFullRepaidAmount: SerializedBNSchema,
  borrowerOriginalLent: SerializedBNSchema,
  repaymentCallAmount: SerializedBNSchema, //? Stores value that borrower needs to pay (NOT value that lender receives)
  currentRemainingLent: SerializedBNSchema,
  fbondTokenMint: SerializedPublicKeySchema,
  feeAmount: SerializedBNSchema,
  interestSnapshot: SerializedBNSchema,
  isDirectSell: z.boolean(),
  lenderFullRepaidAmount: SerializedBNSchema,
  lenderOriginalLent: SerializedBNSchema,
  lendingToken: z.nativeEnum(LendingTokenType),
  partialRepaySnapshot: SerializedBNSchema,
  redeemResult: z.nativeEnum(RedeemResult),
  redeemedAt: SerializedBNSchema,
  repayDestination: z.nativeEnum(RepayDestination),
  seller: SerializedPublicKeySchema,
  solAmount: SerializedBNSchema,
  soldAt: SerializedBNSchema,
  terminationFreeze: SerializedBNSchema,
  terminationStartedAt: SerializedBNSchema,
  user: SerializedPublicKeySchema,
})

const FraktBondSchema = z.object({
  publicKey: SerializedPublicKeySchema,
  activatedAt: SerializedBNSchema,
  actualReturnedAmount: SerializedBNSchema,
  amountToReturn: SerializedBNSchema,
  banxStake: SerializedPublicKeySchema,
  bondTradeTransactionsCounter: SerializedBNSchema,
  borrowedAmount: SerializedBNSchema,
  currentPerpetualBorrowed: SerializedBNSchema,
  fbondIssuer: SerializedPublicKeySchema,
  fbondTokenMint: SerializedPublicKeySchema,
  fbondTokenSupply: SerializedBNSchema,
  fraktBondState: z.nativeEnum(FraktBondState),
  fraktMarket: SerializedPublicKeySchema,
  lastTransactedAt: SerializedBNSchema,
  liquidatingAt: SerializedBNSchema,
  refinanceAuctionStartedAt: SerializedBNSchema,
  repaidOrLiquidatedAt: SerializedBNSchema,
  terminatedCounter: SerializedBNSchema,
  hadoMarket: SerializedPublicKeySchema.optional(), //? Why optional
})

export const LoanSchema = z.object({
  publicKey: SerializedPublicKeySchema,
  fraktBond: FraktBondSchema,
  bondTradeTransaction: BondTradeTransactionSchema,
  nft: NFTSchemaNew,
  totalRepaidAmount: SerializedBNSchema.optional(), //? exist only in fetchLenderLoansAndOffers request
  accruedInterest: SerializedBNSchema.optional(),
})

export const WalletLoansAndOffersShema = z.object({
  nfts: LoanSchema.array(),
  offers: z.record(OfferSchema.array()),
})

export const BorrowNftSchema = z.object({
  mint: SerializedPublicKeySchema,
  loan: z.object({
    marketPubkey: SerializedPublicKeySchema,
    fraktMarket: SerializedPublicKeySchema,
    marketApr: SerializedBNSchema, //? Or number?
    banxStake: SerializedPublicKeySchema.optional(), //? exists when nft is banx and it's staked
  }),
  nft: NFTSchemaNew,
})

export const BorrowNftsAndOffersSchema = z.object({
  nfts: BorrowNftSchema.array(),
  offers: z.record(OfferSchema.array()),
})

export const CollectionMetaSchema = z.object({
  collectionFloor: SerializedBNSchema, //? Or number?
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
