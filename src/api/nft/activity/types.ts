import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { NFTSchema } from '@banx/api/shared'

import { BasePaginationRequest, PaginationMeta } from '../../types'

export const LenderActivitySchema = z.object({
  id: z.string(),
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
  currentRemainingLentAmount: z.number(),
  nft: NFTSchema,
})

export type LenderActivity = z.infer<typeof LenderActivitySchema>

interface LenderActivityRequest extends BasePaginationRequest {
  walletPubkey: string
  tokenType: LendingTokenType
  collection?: string[]
  getAll?: boolean
}

export type FetchLenderActivity = (props: LenderActivityRequest) => Promise<LenderActivity[]>

export interface LenderActivityResponse {
  data: LenderActivity[]
  meta: PaginationMeta
}

export const BorrowerActivitySchema = z.object({
  id: z.string(),
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

  currentRemainingLentAmount: z.number(),
  currentLentAmount: z.number(),
  bondTradeTransaction: z.string(),
})

export type BorrowerActivity = z.infer<typeof BorrowerActivitySchema>

interface BorrowerActivityRequest extends BasePaginationRequest {
  walletPubkey: string
  tokenType: LendingTokenType
  collection?: string[]
  getAll?: boolean
}

export type FetchBorrowerActivity = (props: BorrowerActivityRequest) => Promise<BorrowerActivity[]>

export interface BorrowedActivityResponse {
  data: BorrowerActivity[]
  meta: PaginationMeta
}

export const ActivityCollectionsListSchema = z.object({
  collectionName: z.string(),
  collectionImage: z.string(),
  received: z.number().optional(),
  borrowed: z.number().optional(),
})

export type ActivityCollectionsList = z.infer<typeof ActivityCollectionsListSchema>

export type FetchActivityCollectionsList = (props: {
  walletPubkey: string
  tokenType: LendingTokenType
  userType: 'borrower' | 'lender'
}) => Promise<ActivityCollectionsList[]>
