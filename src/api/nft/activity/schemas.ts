import { z } from 'zod'

import { NFTSchema, StringIntSchema, StringPublicKeySchema } from '@banx/api/shared'

export const BorrowerActivitySchema = z.object({
  id: z.string(),
  status: z.string(),
  publicKey: StringPublicKeySchema,
  apr: StringIntSchema,
  borrowed: StringIntSchema,
  duration: StringIntSchema,
  interest: StringIntSchema,
  nftImageUrl: z.string(),
  nftMint: StringPublicKeySchema,
  nftName: z.string(),
  repaid: StringIntSchema,
  timestamp: z.number(),
  user: StringPublicKeySchema,
  nft: NFTSchema,

  currentRemainingLentAmount: StringIntSchema,
  currentLentAmount: StringIntSchema,
  bondTradeTransaction: StringPublicKeySchema,
})

export const LenderActivitySchema = z.object({
  id: z.string(),
  status: z.string(),
  publicKey: StringPublicKeySchema,
  apr: StringIntSchema,
  duration: StringIntSchema,
  interest: StringIntSchema,
  lent: StringIntSchema,
  nftImageUrl: z.string(),
  nftMint: StringPublicKeySchema,
  nftName: z.string(),
  received: StringIntSchema,
  timestamp: z.number(),
  user: StringPublicKeySchema,
  currentRemainingLentAmount: StringIntSchema,
  nft: NFTSchema,
})

export const ActivityCollectionsListSchema = z.object({
  collectionName: z.string(),
  collectionImage: z.string(),
  received: z.number().optional(),
  borrowed: z.number().optional(),
})
