import { z } from 'zod'

import { NFTSchema, ResponseWithPagination } from '../../shared'

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

export type LenderActivityResponse = ResponseWithPagination<LenderActivity[]>

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

export type BorrowedActivityResponse = ResponseWithPagination<BorrowerActivity[]>

export const ActivityCollectionsListSchema = z.object({
  collectionName: z.string(),
  collectionImage: z.string(),
  received: z.number().optional(),
  borrowed: z.number().optional(),
})

export type ActivityCollectionsList = z.infer<typeof ActivityCollectionsListSchema>
