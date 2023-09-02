import { z } from 'zod'

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
