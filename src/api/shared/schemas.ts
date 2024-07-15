import { BN, web3 } from 'fbonds-core'
import { z } from 'zod'

import { RarityTier } from './types'

export const SerializedBNSchema = z.string().transform((value) => {
  return new BN(value)
})

export const SerializedPublicKeySchema = z.string().transform((value) => {
  return new web3.PublicKey(value)
})

export const RaritySchema = z.object({
  tier: z.nativeEnum(RarityTier), //? string
  rank: z.number(), //? number
})

export const NFTSchema = z.object({
  mint: z.string(),
  meta: z.object({
    imageUrl: z.string(),
    name: z.string(),
    collectionName: z.string(),
    collectionImage: z.string(),
    tensorSlug: z.string(),
    partnerPoints: z.number().optional(),
    playerPoints: z.number().optional(),
  }),
  compression: z
    .object({
      dataHash: z.string(),
      creatorHash: z.string(),
      leafId: z.number(),
      tree: z.string(),
      whitelistEntry: z.string(),
    })
    .optional(),
  collectionFloor: z.number(),
  rarity: RaritySchema.optional(),
})

// export const NFTSchema2 = z.object({
//   mint: SerializedPublicKey,
//   meta: z.object({
//     imageUrl: z.string(),
//     name: z.string(),
//     collectionName: z.string(),
//     collectionImage: z.string(),
//     tensorSlug: z.string(),
//     partnerPoints: z.number().optional(),
//     playerPoints: z.number().optional(),
//   }),
//   compression: z
//     .object({
//       dataHash: z.string(),
//       creatorHash: z.string(),
//       leafId: z.number(),
//       tree: z.string(),
//       whitelistEntry: z.string(),
//     })
//     .optional(),
//   collectionFloor: SerializedBN,
//   rarity: RaritySchema.optional(),
// })
