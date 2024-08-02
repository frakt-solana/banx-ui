import { z } from 'zod'

import { MutationResponse } from '../../shared'
import {
  BonkWithdrawalSchema,
  LeaderboardDataSchema,
  RefPersonalDataSchema,
  SeasonUserRewardsSchema,
} from './schemas'

export type DiscordUserInfoRaw = {
  avatar: string
  discordId: string
  isOnServer: boolean
}

export type DiscordUserInfo = {
  avatarUrl: string | null
  isOnServer: boolean
}

export type SeasonUserRewards = z.infer<typeof SeasonUserRewardsSchema>

export type RefPersonalData = z.infer<typeof RefPersonalDataSchema>

export type LeaderboardData = z.infer<typeof LeaderboardDataSchema>

export type LeaderboardTimeRange = 'all' | 'week'

export type BonkWithdrawal = z.infer<typeof BonkWithdrawalSchema>

export type WithdrawalTokenType = 'bonk' | 'banx'

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
