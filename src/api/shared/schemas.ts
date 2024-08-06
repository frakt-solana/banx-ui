import { BN, web3 } from 'fbonds-core'
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
    collectionId: z.string(),
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
