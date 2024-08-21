import { BN, web3 } from 'fbonds-core'
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

import { RarityTier, TokenStandard } from './types'

export const SerializedBNSchema = z.string().transform((value) => {
  return new BN(value)
})

export const StringIntSchema = z.string().transform((value) => {
  return parseInt(value)
})

export const SerializedPublicKeySchema = z.string().transform((value) => {
  return new web3.PublicKey(value)
})

export const StringPublicKeySchema = z.string()

export const RaritySchema = z.object({
  tier: z.nativeEnum(RarityTier), //? string
  rank: z.number(), //? number
})

export const NFTSchema = z.object({
  mint: StringPublicKeySchema,
  meta: z.object({
    imageUrl: z.string(),
    name: z.string(),
    collectionName: z.string(),
    collectionImage: z.string(),
    tensorSlug: z.string(),
    partnerPoints: z.number().optional(),
    playerPoints: z.number().optional(),
    tokenStandard: z.nativeEnum(TokenStandard).or(z.string().optional()),
    collectionId: z.string().optional(),
  }),
  //? Change to BN and PublicKey?
  compression: z
    .object({
      dataHash: z.string(),
      creatorHash: z.string(),
      leafId: z.number(),
      tree: z.string(),
      whitelistEntry: z.string(),
    })
    .optional(),
  collectionFloor: StringIntSchema,
  rarity: RaritySchema.optional().nullable(),
})

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
  loanApr: StringIntSchema.default('0'),
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
