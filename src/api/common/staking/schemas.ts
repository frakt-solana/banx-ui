import {
  BanxAdventureState,
  BanxAdventureSubscriptionState,
  BanxStakeState,
  BanxStakingSettingsState,
  BanxTokenStakeState,
} from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

import { SerializedBNSchema, StringIntSchema, StringPublicKeySchema } from '@banx/api/shared'

export const BanxStakingSettingsSchema = z.object({
  banxStakingSettingsState: z.nativeEnum(BanxStakingSettingsState),
  publicKey: StringPublicKeySchema,
  banxStaked: SerializedBNSchema,
  maxTokenStakeAmount: SerializedBNSchema,
  rewardsHarvested: SerializedBNSchema,
  tokensPerPartnerPoints: SerializedBNSchema,
  tokensPerWeek: SerializedBNSchema,
  hadesPerWeek: SerializedBNSchema,
  tokensStaked: SerializedBNSchema,
})

export const PointsMapSchema = z.object({
  publicKey: StringPublicKeySchema,
  banxMint: StringPublicKeySchema,
  partnerPoints: StringIntSchema,
  playerPoints: StringIntSchema,
})

export const BanxStakeSchema = z.object({
  publicKey: StringPublicKeySchema,
  adventureSubscriptionsQuantity: SerializedBNSchema,
  banxStakeState: z.nativeEnum(BanxStakeState),
  bond: StringPublicKeySchema,
  collateralTokenAccount: StringPublicKeySchema,
  farmedAmount: SerializedBNSchema,
  isLoaned: z.boolean(),
  isTerminationFreeze: z.boolean().optional(),
  nftMint: StringPublicKeySchema,
  partnerPoints: SerializedBNSchema,
  playerPoints: SerializedBNSchema,
  stakedAt: SerializedBNSchema,
  unstakedOrLiquidatedAt: SerializedBNSchema,
  user: StringPublicKeySchema,
})

export const BanxNftStakeSchema = z.object({
  mint: StringPublicKeySchema,
  meta: z.object({
    imageUrl: z.string(),
    mint: StringPublicKeySchema,
    name: z.string(),
    partnerPoints: z.number(),
    playerPoints: z.number(),
    rarity: z.string(),
  }),
  isLoaned: z.boolean(),
  isTerminationFreeze: z.boolean(),
  pointsMap: PointsMapSchema,
  stake: BanxStakeSchema.optional(),
})

export const BanxAdventureSubscriptionSchema = z.object({
  adventureSubscriptionState: z.nativeEnum(BanxAdventureSubscriptionState),
  user: StringPublicKeySchema,
  adventure: StringPublicKeySchema,
  banxTokenStake: StringPublicKeySchema,
  stakeTokensAmount: SerializedBNSchema,
  stakePartnerPointsAmount: SerializedBNSchema,
  stakePlayerPointsAmount: SerializedBNSchema,
  subscribedAt: SerializedBNSchema,
  unsubscribedAt: SerializedBNSchema,
  harvestedAt: SerializedBNSchema,
  amountOfTokensHarvested: SerializedBNSchema,
  publicKey: StringPublicKeySchema,
  stakeNftAmount: SerializedBNSchema,
  amountOfHadesTokensHarvested: SerializedBNSchema,
})

export const BanxAdventureSchema = z.object({
  adventureState: z.nativeEnum(BanxAdventureState),
  week: SerializedBNSchema,
  amountOfTokensHarvested: SerializedBNSchema,
  periodEndingAt: SerializedBNSchema,
  periodStartedAt: SerializedBNSchema,
  publicKey: StringPublicKeySchema,
  rewardsToBeDistributed: SerializedBNSchema,
  tokensPerPoints: SerializedBNSchema,
  totalBanxSubscribed: SerializedBNSchema,
  totalPartnerPoints: SerializedBNSchema,
  totalPlayerPoints: SerializedBNSchema,
  totalTokensStaked: SerializedBNSchema,
})

export const BanxTokenStakeSchema = z.object({
  banxNftsStakedQuantity: SerializedBNSchema,
  partnerPointsStaked: SerializedBNSchema,
  playerPointsStaked: SerializedBNSchema,
  banxStakeState: z.nativeEnum(BanxTokenStakeState),
  stakedAt: SerializedBNSchema,
  user: StringPublicKeySchema,
  adventureSubscriptionsQuantity: SerializedBNSchema,
  tokensStaked: SerializedBNSchema,
  unstakedAt: SerializedBNSchema,
  farmedAmount: SerializedBNSchema,
  publicKey: StringPublicKeySchema,
  nftsStakedAt: SerializedBNSchema,
  nftsUnstakedAt: SerializedBNSchema,
})

export const BanxAdventuresWithSubscriptionSchema = z.object({
  adventure: BanxAdventureSchema,
  adventureSubscription: BanxAdventureSubscriptionSchema.optional(),
})

export const BanxStakingInfoSchema = z.object({
  banxWalletBalance: SerializedBNSchema.nullable(),
  banxTokenStake: BanxTokenStakeSchema.nullable(),
  banxAdventures: BanxAdventuresWithSubscriptionSchema.array(),
  nfts: BanxNftStakeSchema.array().nullable().optional(),
})
