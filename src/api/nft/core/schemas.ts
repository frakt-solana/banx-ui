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

import { NFTSchema } from '@banx/api/shared'

const MarketMetaSchema = z.object({
  marketApr: z.number(), //? base points
  collectionName: z.string(), //? string
  collectionImage: z.string(), //? string
})

export const MarketPreviewSchema = z
  .object({
    marketPubkey: z.string(), //? Public key
    collectionFloor: z.number(), //? BN
    offerTvl: z.number(), //? BN
    bestOffer: z.number(), //? BN
    bestLtv: z.number(), //? base points
    activeBondsAmount: z.number(), //? BN
    activeOfferAmount: z.number(), //? BN
    loansTvl: z.number(), //? BN
    isHot: z.boolean(), //? boolean
    tensorSlug: z.string(), //? string
  })
  .merge(MarketMetaSchema)

const BondingCurveSchema = z.object({
  delta: z.number(),
  bondingType: z.nativeEnum(BondingCurveType),
})

const ValidationPairSchema = z.object({
  loanToValueFilter: z.number(),
  collateralsPerToken: z.number(),
  maxReturnAmountFilter: z.number(),
  bondFeatures: z.nativeEnum(BondFeatures),
})

export const OfferSchema = z.object({
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
  pairState: z.nativeEnum(PairState),
  validation: ValidationPairSchema,

  fundsInCurrentEpoch: z.number(),
  fundsInNextEpoch: z.number(),
  lastCalculatedSlot: z.number(),
  lastCalculatedTimestamp: z.number(),
  rewardsToHarvest: z.number(),
  rewardsToHarvested: z.number(),
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
  offerWasClosed: z.boolean().optional(), //? true if loan offer was removed (state is PerpetualClosed). false if offer is active or it's listing
  //TODO: offerWasClosed already don't use because of lender vault feature, need to remove it
})

export const WalletLoansAndOffersShema = z.object({
  nfts: LoanSchema.array(),
  offers: z.record(OfferSchema.array()),
})

export const BorrowNftSchema = z.object({
  mint: z.string(),
  loan: z.object({
    marketPubkey: z.string(),
    fraktMarket: z.string(),
    marketApr: z.number(),
    banxStake: z.string().optional(),
  }),
  nft: NFTSchema,
})

export const BorrowNftsAndOffersSchema = z.object({
  nfts: BorrowNftSchema.array(),
  offers: z.record(OfferSchema.array()),
})

export const CollectionMetaSchema = z.object({
  collectionFloor: z.number(),
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
