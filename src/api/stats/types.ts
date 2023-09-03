import { z } from 'zod'

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

export interface UserOffersStatsResponse {
  data: UserOffersStats
}

export const UserLoansStatsSchema = z.object({
  loans: z.number(),
  totalBorrowed: z.number(),
  totalLoans: z.number(),
  totalDebt: z.number(),
  totalRepaid: z.number(),
})

export type UserLoansStats = z.infer<typeof UserLoansStatsSchema>

export interface UserLoansStatsResponse {
  data: UserLoansStats
}
