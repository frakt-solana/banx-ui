import { z } from 'zod'

import { MutationResponse } from '../../types'

export interface DiscordUserInfoRaw {
  avatar: string
  discordId: string
  isOnServer: boolean
}

export interface DiscordUserInfo {
  avatarUrl: string | null
  isOnServer: boolean
}

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
})

export type SeasonUserRewards = z.infer<typeof SeasonUserRewardsSchema>

export const RefPersolanDataSchema = z.object({
  user: z.string(),
  refCode: z.string(),
  referredBy: z.string(),
  refUsers: z.string().array(),
})

export type RefPersolanData = z.infer<typeof RefPersolanDataSchema>

export const LeaderboardDataSchema = z.object({
  rank: z.number(),
  avatar: z.string().nullable(),
  user: z.string(),
  points: z.number(),
})

export type LeaderboardData = z.infer<typeof LeaderboardDataSchema>

export type LeaderboardTimeRange = 'all' | 'week'

export const BonkWithdrawalSchema = z.object({
  requestId: z.string(),
  rawTransaction: z.number().array(),
})
export type BonkWithdrawal = z.infer<typeof BonkWithdrawalSchema>

export type LinkedWalletPoints = {
  borrowerPoints: number
  borrowerRank: number
  lenderPoints: number
  lenderRank: number
  boost: number
}

export type LinkedWallet = {
  type: 'main' | 'linked'
  wallet: string
} & LinkedWalletPoints

export type LinkWalletResponse = MutationResponse & LinkedWalletPoints
