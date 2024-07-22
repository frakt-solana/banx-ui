import {
  BondTradeTransactionV2State,
  BondTradeTransactionV2Type,
  FraktBondState,
  LendingTokenType,
  RedeemResult,
  RepayDestination,
} from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { OfferSchema } from '@banx/api/nft'
import { PaginationMeta } from '@banx/api/types'

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

export type TokenMeta = z.infer<typeof TokenMetaSchema>

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

export type TokenLoan = z.infer<typeof TokenLoanSchema>

export const TokenLoanSchema = z.object({
  publicKey: z.string(),
  fraktBond: FraktBondSchema,
  bondTradeTransaction: BondTradeTransactionSchema,
  collateral: TokenMetaSchema,
  collateralPrice: z.number(),
})

export const TokenMarketPreviewSchema = z.object({
  marketPubkey: z.string(),

  collateral: TokenMetaSchema,
  collateralPrice: z.number(),

  collectionName: z.string(),

  offersTvl: z.number(),
  loansTvl: z.number(),

  activeOffersAmount: z.number(),
  activeLoansAmount: z.number(),

  bestOffer: z.number(),
  bestLtv: z.number(), // TODO: remove from BE

  marketApr: z.number(),
  marketApy: z.number(),
  marketUtilizationRate: z.number().nullable(),

  isHot: z.boolean(),
})

export type TokenMarketPreview = z.infer<typeof TokenMarketPreviewSchema>

export interface TokenMarketPreviewResponse {
  data: TokenMarketPreview[]
  meta: PaginationMeta
}

export const TokenOfferPreviewSchema = z.object({
  publicKey: z.string(),
  bondOffer: OfferSchema,
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

export type TokenOfferPreview = z.infer<typeof TokenOfferPreviewSchema>

export const WalletTokenLoansAndOffersShema = z.object({
  loans: z.array(TokenLoanSchema),
  offers: z.record(OfferSchema.array()),
})

export type WalletTokenLoansAndOffers = z.infer<typeof WalletTokenLoansAndOffersShema>

export const TokenLoansRequestsSchema = z.object({
  auctions: TokenLoanSchema.array(),
  listings: TokenLoanSchema.array(),
})

export type TokenLoansRequests = z.infer<typeof TokenLoansRequestsSchema>

export interface AllTokenLoansRequestsResponse {
  data: TokenLoansRequests
  meta: PaginationMeta
}

export const CollateralTokenSchema = z.object({
  marketPubkey: z.string(),
  collateral: TokenMetaSchema,
  collateralPrice: z.number(),
  amountInWallet: z.number(),
})

export type CollateralToken = z.infer<typeof CollateralTokenSchema>
