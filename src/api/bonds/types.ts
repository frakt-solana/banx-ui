import { z } from 'zod'

const MarketPreviewUserSchema = z.object({
  offerAmount: z.number(),
  bondsAmount: z.number(),
  loansTVL: z.number(),
  offerTVL: z.number(),
})

export const MarketPreviewSchema = z.object({
  marketPubkey: z.string(),
  collectionName: z.string(),
  collectionImage: z.string(),
  collectionFloor: z.number(),
  offerTVL: z.number(),
  apy: z.number(), //? %
  bestOffer: z.number(), //? lamports
  bestLTV: z.number(),
  activeBondsAmount: z.number(),
  activeOfferAmount: z.number(),
  fee: z.number(),
  loansTVL: z.number(),
  user: MarketPreviewUserSchema.optional(),
})

export type MarketPreviewUser = z.infer<typeof MarketPreviewUserSchema>
export type MarketPreview = z.infer<typeof MarketPreviewSchema>
