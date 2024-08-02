import { z } from 'zod'

export const SeasonUserRewardsSchema = z.object({
  totalClaimed: z.number(),
  availableToClaim: z.number(),
  playerPoints: z.number(),
  loyalty: z.number(), //? F.e 1 => 0 percentage, 2 => 100 percentage
  earlyIncentives: z.number(),
  firstSeasonRewards: z.number(),
  secondSeasonRewards: z.number(),
  totalParticipants: z.number(),
  bonkRewards: z
    .object({
      totalAccumulated: z.number(),
      available: z.number(),
      redeemed: z.number(),
    })
    .optional(),
  banxRewards: z
    .object({
      totalAccumulated: z.number(),
      available: z.number(),
      redeemed: z.number(),
    })
    .optional(),
})

export const RefPersonalDataSchema = z.object({
  user: z.string(),
  refCode: z.string(),
  referredBy: z.string(),
  refUsers: z.string().array(),
})

export const LeaderboardDataSchema = z.object({
  rank: z.number(),
  avatar: z.string().nullable(),
  user: z.string(),
  points: z.number(),
})

export const BonkWithdrawalSchema = z.object({
  requestId: z.string(),
  rawTransaction: z.number().array(),
})
