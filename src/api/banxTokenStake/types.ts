import {
  BanxAdventureState,
  BanxAdventureSubscriptionState,
  BanxStakingSettingsState,
  BanxTokenStakeState,
} from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

export const BanxSubscriptionSchema = z.object({
  adventureSubscriptionState: z.nativeEnum(BanxAdventureSubscriptionState),
  user: z.string(),
  adventure: z.string(),
  banxTokenStake: z.string(),
  stakeTokensAmount: z.number(),
  stakePartnerPointsAmount: z.number(),
  stakePlayerPointsAmount: z.number(),
  subscribedAt: z.number(),
  unsubscribedAt: z.number(),
  harvestedAt: z.number(),
  amountOfTokensHarvested: z.number(),
  publicKey: z.string(),
  stakeNftAmount: z.number(),
})
export type BanxSubscription = z.infer<typeof BanxSubscriptionSchema>

export const BanxAdventureSchema = z.object({
  adventureState: z.nativeEnum(BanxAdventureState),
  week: z.number(),
  amountOfTokensHarvested: z.number(),
  periodEndingAt: z.number(),
  periodStartedAt: z.number(),
  publicKey: z.string(),
  rewardsToBeDistributed: z.number(),
  placeholderOne: z.string(),
  tokensPerPoints: z.number(),
  totalBanxSubscribed: z.number(),
  totalPartnerPoints: z.number(),
  totalPlayerPoints: z.number(),
  totalTokensStaked: z.number(),
})
export type BanxAdventure = z.infer<typeof BanxAdventureSchema>

export const BanxTokenStakeSchema = z.object({
  banxNftsStakedQuantity: z.number(),
  partnerPointsStaked: z.number(),
  playerPointsStaked: z.number(),
  banxStakeState: z.nativeEnum(BanxTokenStakeState),
  stakedAt: z.number(),
  user: z.string(),
  adventureSubscriptionsQuantity: z.number(),
  tokensStaked: z.number(),
  unstakedAt: z.number(),
  farmedAmount: z.number(),
  placeholderOne: z.string(),
  publicKey: z.string(),
  nftsStakedAt: z.number(),
  nftsUnstakedAt: z.number(),
})
export type BanxTokenStake = z.infer<typeof BanxTokenStakeSchema>

export const BanxStakeSchema = z.object({
  banxTokenStake: BanxTokenStakeSchema,
  banxAdventures: z
    .object({
      banxAdventure: BanxAdventureSchema,
      adventureSubscription: BanxSubscriptionSchema.optional(),
    })
    .array(),
})
export type BanxStake = z.infer<typeof BanxStakeSchema>

export const BanxStakeSettingsSchema = z.object({
  publicKey: z.string(),
  banxStaked: z.number(),
  banxStakingSettingsState: z.nativeEnum(BanxStakingSettingsState),
  maxTokenStakeAmount: z.number(),
  placeholderOne: z.string(),
  rewardsHarvested: z.number(),
  tokensPerPartnerPoints: z.number(),
  tokensPerWeek: z.number(),
  tokensStaked: z.number(),
})
export type BanxStakeSettings = z.infer<typeof BanxStakeSettingsSchema>
