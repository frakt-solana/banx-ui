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
  paidInterest: z.number(),
  pendingInterest: z.number(),
})

export const UserLoansStatsSchema = z.object({
  loans: z.number(),
  totalBorrowed: z.number(),
  totalLoans: z.number(),
  totalDebt: z.number(),
  totalRepaid: z.number(),
})

export const AllTotalStatsSchema = z.object({
  dailyVolume: z.number(),
  activeLoans: z.number(),
  totalValueLocked: z.number(),
  loansVolumeAllTime: z.number(),
})

export const TotalLenderStatsSchema = z.object({
  allocation: z.object({
    activeLoans: z.number(),
    underWaterLoans: z.number(),
    terminatingLoans: z.number(),
    pendingOffers: z.number(),
    weeklyInterest: z.number(),
    weightedApy: z.number(),
  }),
  allTime: z.object({
    totalLent: z.number(),
    totalInterestEarned: z.number(),
    totalRepaid: z.number(),
    totalDefaulted: z.number(),
    paidInterest: z.number(),
    pendingInterest: z.number(),
    weightedApy: z.number(),
  }),
})

export const TotalBorrowerStatsSchema = z.object({
  activeLoansCount: z.number(),
  terminatingLoansCount: z.number(),
  liquidationLoansCount: z.number(),
  totalBorrowed: z.number(),
  totalDebt: z.number(),
  totalWeeklyInterest: z.number(),
})
