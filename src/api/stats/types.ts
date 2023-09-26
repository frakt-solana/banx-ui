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

export const AllTotalStatsSchema = z.object({
  dailyVolume: z.number(),
  activeLoans: z.number(),
  totalValueLocked: z.number(),
  loansVolumeAllTime: z.number(),
})

export type AllTotalStats = z.infer<typeof AllTotalStatsSchema>

export const TotalLenderStatsSchema = z.object({
  allocation: z.object({
    activeLoans: z.number(),
    underWaterLoans: z.number(),
    pendingOffers: z.number(),
    weeklyInterest: z.number(),
    weightedApy: z.number(),
  }),
  allTime: z.object({
    totalLent: z.number(),
    totalInterestEarned: z.number(),
    totalRepaid: z.number(),
    totalDefaulted: z.number(),
  }),
})

export type TotalLenderStats = z.infer<typeof TotalLenderStatsSchema>

export const TotalBorrowerStatsSchema = z.object({
  activeLoans: z.number(),
  terminatingLoans: z.number(),
  liquidationLoans: z.number(),
  totalBorrowed: z.number(),
  totalDebt: z.number(),
})

export type TotalBorrowerStats = z.infer<typeof TotalBorrowerStatsSchema>
