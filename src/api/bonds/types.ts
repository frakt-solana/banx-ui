import { z } from 'zod'

import { Meta } from '@banx/types'

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
})

export type MarketPreview = z.infer<typeof MarketPreviewSchema>

export interface MarketPreviewResponse {
  data: MarketPreview[]
  meta: Meta
}
