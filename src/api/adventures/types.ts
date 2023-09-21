import { AdventureState, BanxStakeState } from 'fbonds-core/lib/fbond-protocol/types'
import { z } from 'zod'

export enum BanxTier {
  COMMON = 'Common',
  UNCOMMON = 'Uncommon',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary',
}

export enum AdventureStatus {
  LIVE = 'live',
  UPCOMING = 'upcoming',
  ENDED = 'ended',
}

export enum SubscriptionStatus {
  Active = 'active',
  Unsubscribed = 'unsubscribed',
  Harvested = 'harvested',
}

export const AdventureSchema = z.object({
  adventureState: z.nativeEnum(AdventureState),
  periodStartedAt: z.number(),
  periodEndingAt: z.number(),
  rewardsUpperLimit: z.number(),
  rewardsLowerLimit: z.number(),
  totalPeriodRevenue: z.number(),
  rewardsToBeDistributed: z.number(),
  totalBanxSubscribed: z.number(),
  totalPartnerPoints: z.number(),
  totalPlayerPoints: z.number(),
  banxSubscribedLeft: z.number(),
  partnerPointsLeft: z.number(),
  playerPointsLeft: z.number(),
  rewardsLeft: z.number(),
  publicKey: z.string(),
})
export type Adventure = z.infer<typeof AdventureSchema>

export const BanxUserSchema = z.object({
  user: z.string(),
  stakedPlayerPoints: z.number(),
  stakedPartnerPoints: z.number(),
  stakedBanx: z.number(),
  totalHarvestedRewards: z.number(),
  freeLiquidityCurrent: z.number(),
  placeholderOne: z.string(),
  publicKey: z.string(),
})
export type BanxUser = z.infer<typeof BanxUserSchema>

export const BanxStakeSchema = z.object({
  banxStakeState: z.nativeEnum(BanxStakeState),
  adventureSubscriptionsQuantity: z.number(),
  nftMint: z.string(),
  collateralTokenAccount: z.string(),
  user: z.string(),
  stakedAt: z.number(),
  unstakedOrLiquidatedAt: z.number(),
  isLoaned: z.boolean(),
  bond: z.string(),
  playerPoints: z.number(),
  partnerPoints: z.number(),
  farmedAmount: z.number(),
  placeholderOne: z.string(),
  publicKey: z.string(),
})
export type BanxStake = z.infer<typeof BanxStakeSchema>

export const AdventureSubscriptionSchema = z.object({
  user: z.string(),
  stake: z.string(),
  adventure: z.string(),
  subscribedAt: z.number(),
  unsubscribedAt: z.number(),
  harvestedAt: z.number(),
  amountOfSolHarvested: z.number(),
  placeholderOne: z.string(),
  publicKey: z.string(),
})
export type AdventureSubscription = z.infer<typeof AdventureSubscriptionSchema>

export const AdventureNftSchema = z.object({
  mint: z.string(),
  meta: z.object({
    mint: z.string(),
    name: z.string(),
    imageUrl: z.string(),
    rarity: z.nativeEnum(BanxTier),
    partnerPoints: z.number(),
    playerPoints: z.number(),
  }),
  banxStake: BanxStakeSchema.optional(),
  subscriptions: AdventureSubscriptionSchema.array(),
})
export type AdventureNft = z.infer<typeof AdventureNftSchema>

//? adventures/?userPubkey
export const AdventuresInfoSchema = z.object({
  adventures: AdventureSchema.array(),
  banxUser: BanxUserSchema.optional(), //? if userPubkey exists
  nfts: AdventureNftSchema.array().optional(), //? if userPubkey exists
})
export type AdventuresInfo = z.infer<typeof AdventuresInfoSchema>

export const BanxStatsSchema = z.object({
  totalRevealed: z.number(),
  totalPartnerPoints: z.number(),
})

export type BanxStats = z.infer<typeof BanxStatsSchema>

export { AdventureState, BanxStakeState }
