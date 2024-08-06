import { z } from 'zod'

import {
  BanxAdventureSchema,
  BanxAdventureSubscriptionSchema,
  BanxAdventuresWithSubscriptionSchema,
  BanxNftStakeSchema,
  BanxStakeSchema,
  BanxStakingInfoSchema,
  BanxStakingSettingsSchema,
  BanxTokenStakeSchema,
} from './schemas'

export type BanxStakingSettings = z.infer<typeof BanxStakingSettingsSchema>

export type BanxStake = z.infer<typeof BanxStakeSchema>

export type BanxNftStake = z.infer<typeof BanxNftStakeSchema>

export type BanxAdventureSubscription = z.infer<typeof BanxAdventureSubscriptionSchema>

export type BanxAdventure = z.infer<typeof BanxAdventureSchema>

export type BanxTokenStake = z.infer<typeof BanxTokenStakeSchema>

export type BanxAdventuresWithSubscription = z.infer<typeof BanxAdventuresWithSubscriptionSchema>

export type BanxStakingInfo = z.infer<typeof BanxStakingInfoSchema>

export enum AdventureStatus {
  LIVE = 'live',
  UPCOMING = 'upcoming',
  ENDED = 'ended',
}
