import { z } from 'zod'

import { TokenMetaSchema } from '../core/schemas'

export const LenderTokenActivitySchema = z.object({
  id: z.string(),
  publicKey: z.string(),

  collateral: TokenMetaSchema,
  tokenSupply: z.number(),

  apr: z.number(),
  currentRemainingLentAmount: z.number(),
  interest: z.number(),
  received: z.number(),
  status: z.string(),
  timestamp: z.number(),
})

export const TokenBorrowerActivitySchema = z.object({
  id: z.string(),
  publicKey: z.string(),

  collateral: TokenMetaSchema,
  tokenSupply: z.number(),

  borrowed: z.number(),
  currentRemainingLentAmount: z.number(),
  interest: z.number(),
  repaid: z.number(),
  status: z.string(),
  timestamp: z.number(),
})

export const TokenActivityCollectionsListSchema = z.object({
  collectionName: z.string(), //? Rename to collateralTicker
  collectionImage: z.string(), //? Rename to collateralLogoUrl
  received: z.number().optional(), //? Rename to totalReceived
  borrowed: z.number().optional(), //? Rename to totalBorrowed
})
