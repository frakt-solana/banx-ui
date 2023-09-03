import { z } from 'zod'

import { PaginationMeta } from '@banx/types'

export interface UserOffersStatsResponse {
  data: UserOffersStats
  meta: PaginationMeta
}

export const UserOffersStatsSchema = z.object({
  loansVolume: z.number(),
  offersVolume: z.number(),
  earned: z.number(),
  totalOffers: z.number(),
  totalLent: z.number(),
  totalInterest: z.number(),
  weightedApr: z.number(),
  totalReceived: z.number(),
})

export type UserOffersStats = z.infer<typeof UserOffersStatsSchema>
