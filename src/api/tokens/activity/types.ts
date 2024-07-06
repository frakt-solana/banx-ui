import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { BasePaginationRequest, PaginationMeta } from '../../types'
import { TokenMetaSchema } from '../core'

export const LenderTokenActivitySchema = z.object({
  id: z.string(),
  publicKey: z.string(),

  collateral: TokenMetaSchema,

  status: z.string(),
  lent: z.number(),
  currentRemainingLentAmount: z.number(),
  interest: z.number(),
  apr: z.number(),
  duration: z.number(),
  received: z.number(),
  timestamp: z.number(),

  //TODO (TokenLending): remove from BE
  // user: z.string(),
  // finalVersion: z.boolean(),
  // lendingToken: z.nativeEnum(LendingTokenType),
  // bondTradeTransactionType: z.nativeEnum(BondTradeTransactionV2Type),
  // collectionName: z.string(),
  // collateralPrice: z.number(),
})

export type LenderTokenActivity = z.infer<typeof LenderTokenActivitySchema>

interface LenderTokenActivityRequest extends BasePaginationRequest {
  walletPubkey: string
  tokenType: LendingTokenType
  collection?: string[]
  getAll?: boolean
}

export type FetchLenderTokenActivity = (
  props: LenderTokenActivityRequest,
) => Promise<LenderTokenActivity[]>

export interface LenderTokenActivityResponse {
  data: LenderTokenActivity[]
  meta: PaginationMeta
}

export const TokenBorrowerActivitySchema = z.object({
  id: z.string(),
  publicKey: z.string(),

  collateral: TokenMetaSchema,

  borrowed: z.number(),
  currentRemainingLentAmount: z.number(),
  interest: z.number(),
  repaid: z.number(),
  status: z.string(),
  timestamp: z.number(),

  //TODO (TokenLending): remove from BE
  // lendingToken: z.nativeEnum(LendingTokenType),
  // currentLentAmount: z.number(),
  // apr: z.number(),
  // duration: z.number(),
  // user: z.string(),
  // soldAt: z.number(),
  // bondTradeTransaction: z.string(),
  // collectionName: z.string(),
  // bondTradeTransactionType: z.nativeEnum(BondTradeTransactionV2Type),
  // collateralPrice: z.number(),
})

export type TokenBorrowerActivity = z.infer<typeof TokenBorrowerActivitySchema>

interface BorrowerActivityRequest extends BasePaginationRequest {
  walletPubkey: string
  tokenType: LendingTokenType
  collection?: string[]
  getAll?: boolean
}

export type FetchBorrowerActivity = (
  props: BorrowerActivityRequest,
) => Promise<TokenBorrowerActivity[]>

export interface TokenBorrowedActivityResponse {
  data: TokenBorrowerActivity[]
  meta: PaginationMeta
}

export const TokenActivityCollectionsListSchema = z.object({
  collectionName: z.string(), //? Rename to collateralTicker
  collectionImage: z.string(), //? Rename to collateralLogoUrl
  received: z.number().optional(), //? Rename to totalReceived
  borrowed: z.number().optional(), //? Rename to totalBorrowed
})

export type TokenActivityCollectionsList = z.infer<typeof TokenActivityCollectionsListSchema>

export type FetchTokenActivityCollectionsList = (props: {
  walletPubkey: string
  tokenType: LendingTokenType
  userType: 'borrower' | 'lender'
}) => Promise<TokenActivityCollectionsList[]>
