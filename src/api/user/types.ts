import { z } from 'zod'

export interface DiscordUserInfoRaw {
  avatar: string
  discordId: string
  isOnServer: boolean
}

export interface DiscordUserInfo {
  avatarUrl: string | null
  isOnServer: boolean
}

export enum BanxNotificationType {
  LOAN = 'loan',
  DEPOSIT = 'deposit',
  LOT_TICKET = 'lotTicket',
  GRACE = 'grace',
}

export interface BanxNotification {
  id: string
  type: BanxNotificationType
  user: string
  message: {
    title: string
    body: string
  }
  image?: string
  isRead: boolean
  date: number
}

export interface UserLockedRewards {
  rewards: number
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
})

export type SeasonUserRewards = z.infer<typeof SeasonUserRewardsSchema>

export const LeaderboardDataSchema = z.object({
  rank: z.number(),
  avatar: z.string().nullable(),
  user: z.string(),
  points: z.number(),
  loyalty: z.number(), //? F.e 1 => 0 percentage, 2 => 100 percentage
})

export type LeaderboardData = z.infer<typeof LeaderboardDataSchema>

// TODO: need to rename "Sol" to "totalReceived"
export const LeaderboardUsersStatsSchema = z.object({
  user: z.string(),
  Sol: z.string(),
})

export type LeaderboardUsersStats = z.infer<typeof LeaderboardUsersStatsSchema>

export type LeaderboardTimeRange = 'all' | 'week'
