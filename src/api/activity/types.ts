import { z } from 'zod'

import { BasePaginationRequest, PaginationMeta } from '@banx/types'

import { NFTSchema } from '../core'

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

interface LenderActivityRequest extends BasePaginationRequest {
  walletPubkey: string
  collection?: string[]
}

export type FetchLenderActivity = (props: LenderActivityRequest) => Promise<LenderActivity[]>

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

interface BorrowerActivityRequest extends BasePaginationRequest {
  walletPubkey: string
  collection?: string[]
}

export type FetchBorrowerActivity = (props: BorrowerActivityRequest) => Promise<BorrowerActivity[]>

export interface BorrowedActivityResponse {
  data: BorrowerActivity[]
  meta: PaginationMeta
}

export const ActivityCollectionsListSchema = z.object({
  collections: z.array(z.string()),
})

export type ActivityCollectionsList = z.infer<typeof ActivityCollectionsListSchema>

export type FetchActivityCollectionsList = (props: {
  walletPubkey: string
  userType: 'borrower' | 'lender'
}) => Promise<ActivityCollectionsList>
