import {
  BanxAdventureState,
  BanxAdventureSubscriptionState,
  BanxStakeState,
  BanxStakingSettingsState,
  BanxTokenStakeState,
} from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

export const PointsMapSchema = z.object({
  banxMint: z.string(),
  partnerPoints: z.number(),
  playerPoints: z.number(),
  publicKey: z.string(),
})
export type PointsMap = z.infer<typeof PointsMapSchema>

export const StakeSchema = z.object({
  publicKey: z.string(),
  adventureSubscriptionsQuantity: z.number(),
  banxStakeState: z.nativeEnum(BanxStakeState),
  bond: z.string(),
  collateralTokenAccount: z.string(),
  farmedAmount: z.number(),
  isLoaned: z.boolean(),
  nftMint: z.string(),
  partnerPoints: z.number(),
  placeholderOne: z.string(),
  playerPoints: z.number(),
  stakedAt: z.number(),
  unstakedOrLiquidatedAt: z.number(),
  user: z.string(),
})
export type Stake = z.infer<typeof StakeSchema>

export const NftSchema = z.object({
  meta: z.object({
    imageUrl: z.string(),
    mint: z.string(),
    name: z.string(),
    partnerPoints: z.number(),
    playerPoints: z.number(),
    rarity: z.string(),
  }),
  isLoaned: z.boolean(),
  mint: z.string(),
  pointsMap: PointsMapSchema,
  stake: StakeSchema,
})
export type NftType = z.infer<typeof NftSchema>

export const BanxSubscriptionSchema = z.object({
  adventureSubscriptionState: z.nativeEnum(BanxAdventureSubscriptionState),
  user: z.string(),
  adventure: z.string(),
  banxTokenStake: z.string(),
  stakeTokensAmount: z.string(),
  stakePartnerPointsAmount: z.string(),
  stakePlayerPointsAmount: z.string(),
  subscribedAt: z.string(),
  unsubscribedAt: z.string(),
  harvestedAt: z.string(),
  amountOfTokensHarvested: z.string(),
  publicKey: z.string(),
  stakeNftAmount: z.string(),
})
export type BanxSubscription = z.infer<typeof BanxSubscriptionSchema>

export const BanxAdventureSchema = z.object({
  adventureState: z.nativeEnum(BanxAdventureState),
  week: z.string(),
  amountOfTokensHarvested: z.string(),
  periodEndingAt: z.string(),
  periodStartedAt: z.string(),
  publicKey: z.string(),
  rewardsToBeDistributed: z.string(),
  placeholderOne: z.string(),
  tokensPerPoints: z.string(),
  totalBanxSubscribed: z.string(),
  totalPartnerPoints: z.string(),
  totalPlayerPoints: z.string(),
  totalTokensStaked: z.string(),
})
export type BanxAdventure = z.infer<typeof BanxAdventureSchema>

export const BanxTokenStakeSchema = z.object({
  banxNftsStakedQuantity: z.string(),
  partnerPointsStaked: z.string(),
  playerPointsStaked: z.string(),
  banxStakeState: z.nativeEnum(BanxTokenStakeState),
  stakedAt: z.string(),
  user: z.string(),
  adventureSubscriptionsQuantity: z.string(),
  tokensStaked: z.string(),
  unstakedAt: z.string(),
  farmedAmount: z.string(),
  placeholderOne: z.string(),
  publicKey: z.string(),
  nftsStakedAt: z.string(),
  nftsUnstakedAt: z.string(),
})
export type BanxTokenStake = z.infer<typeof BanxTokenStakeSchema>

export const BanxAdventuresSchema = z.object({
  adventure: BanxAdventureSchema,
  adventureSubscription: BanxSubscriptionSchema.optional(),
})
export type BanxAdventureWithSubscription = z.infer<typeof BanxAdventuresSchema>

export const BanxStakeSchema = z.object({
  banxWalletBalance: z.string().nullable(),
  banxTokenStake: BanxTokenStakeSchema.nullable(),
  banxAdventures: BanxAdventuresSchema.array(),
  nfts: NftSchema.array().optional(),
})
export type BanxStake = z.infer<typeof BanxStakeSchema>

export const BanxStakingSettingsSchema = z.object({
  publicKey: z.string(),
  banxStaked: z.string(),
  banxStakingSettingsState: z.nativeEnum(BanxStakingSettingsState),
  maxTokenStakeAmount: z.string(),
  placeholderOne: z.string(),
  rewardsHarvested: z.string(),
  tokensPerPartnerPoints: z.string(),
  tokensPerWeek: z.string(),
  tokensStaked: z.string(),
})
export type BanxStakingSettings = z.infer<typeof BanxStakingSettingsSchema>
