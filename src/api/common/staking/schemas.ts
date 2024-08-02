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
  publicKey: StringPublicKeySchema,
  banxStaked: SerializedBNSchema,
  banxStakingSettingsState: z.nativeEnum(BanxStakingSettingsState),
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
  adventureSubscriptionsQuantity: StringIntSchema,
  banxStakeState: z.nativeEnum(BanxStakeState),
  bond: StringPublicKeySchema,
  collateralTokenAccount: StringPublicKeySchema,
  farmedAmount: SerializedBNSchema,
  isLoaned: z.boolean(),
  isTerminationFreeze: z.boolean().optional(),
  nftMint: StringPublicKeySchema,
  partnerPoints: StringIntSchema,
  playerPoints: StringIntSchema,
  stakedAt: StringIntSchema,
  unstakedOrLiquidatedAt: StringIntSchema,
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
  stakePartnerPointsAmount: StringIntSchema,
  stakePlayerPointsAmount: StringIntSchema,
  subscribedAt: StringIntSchema,
  unsubscribedAt: StringIntSchema,
  harvestedAt: StringIntSchema,
  amountOfTokensHarvested: SerializedBNSchema,
  publicKey: StringPublicKeySchema,
  stakeNftAmount: StringIntSchema,
  amountOfHadesTokensHarvested: SerializedBNSchema,
})

export const BanxAdventureSchema = z.object({
  adventureState: z.nativeEnum(BanxAdventureState),
  week: StringIntSchema,
  amountOfTokensHarvested: SerializedBNSchema,
  periodEndingAt: StringIntSchema,
  periodStartedAt: StringIntSchema,
  publicKey: StringPublicKeySchema,
  rewardsToBeDistributed: SerializedBNSchema,
  tokensPerPoints: SerializedBNSchema,
  totalBanxSubscribed: StringIntSchema,
  totalPartnerPoints: StringIntSchema,
  totalPlayerPoints: StringIntSchema,
  totalTokensStaked: SerializedBNSchema,
})

export const BanxTokenStakeSchema = z.object({
  banxNftsStakedQuantity: StringIntSchema,
  partnerPointsStaked: StringIntSchema,
  playerPointsStaked: StringIntSchema,
  banxStakeState: z.nativeEnum(BanxTokenStakeState),
  stakedAt: StringIntSchema,
  user: StringPublicKeySchema,
  adventureSubscriptionsQuantity: StringIntSchema,
  tokensStaked: SerializedBNSchema,
  unstakedAt: StringIntSchema,
  farmedAmount: SerializedBNSchema,
  publicKey: StringPublicKeySchema,
  nftsStakedAt: StringIntSchema,
  nftsUnstakedAt: StringIntSchema,
})

export const BanxAdventuresWithSubscriptionSchema = z.object({
  adventure: BanxAdventureSchema,
  adventureSubscription: BanxAdventureSubscriptionSchema.optional(),
})

export const BanxStakingInfoSchema = z.object({
  banxWalletBalance: SerializedBNSchema.nullable(),
  banxTokenStake: BanxTokenStakeSchema.nullable(),
  banxAdventures: BanxAdventuresWithSubscriptionSchema.array(),
  nfts: BanxNftStakeSchema.array().nullable(),
})
