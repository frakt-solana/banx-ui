import { BN } from 'fbonds-core'
import {
  BanxAdventureState,
  BanxAdventureSubscriptionState,
  BanxStakeState,
  BanxStakingSettingsState,
  BanxTokenStakeState,
} from 'fbonds-core/lib/fbond-protocol/types'

import { PointsMap } from './schemas'

export enum AdventureStatus {
  LIVE = 'live',
  UPCOMING = 'upcoming',
  ENDED = 'ended',
}

export type BanxStakingSettingsBN = {
  publicKey: string
  banxStaked: BN
  banxStakingSettingsState: BanxStakingSettingsState
  maxTokenStakeAmount: BN
  rewardsHarvested: BN
  tokensPerPartnerPoints: BN
  tokensPerWeek: BN
  tokensStaked: BN
  placeholderOne: string
}

export type BanxNftStakeBN = {
  publicKey: string
  adventureSubscriptionsQuantity: number
  banxStakeState: BanxStakeState
  bond: string
  collateralTokenAccount: string
  farmedAmount: BN
  isLoaned: boolean
  nftMint: string
  partnerPoints: number
  playerPoints: number
  stakedAt: number
  unstakedOrLiquidatedAt: number
  user: string
  placeholderOne: string
}

export type BanxStakeNft = {
  meta: {
    imageUrl: string
    mint: string
    name: string
    partnerPoints: number
    playerPoints: number
    rarity: string
  }
  isLoaned: boolean
  mint: string
  pointsMap: PointsMap
  stake?: BanxNftStakeBN
}

export type BanxAdventureSubscriptionBN = {
  publicKey: string
  user: string
  adventureSubscriptionState: BanxAdventureSubscriptionState
  adventure: string
  banxTokenStake: string
  stakeTokensAmount: BN
  stakePartnerPointsAmount: number
  stakePlayerPointsAmount: number
  amountOfTokensHarvested: BN
  stakeNftAmount: number
  subscribedAt: number
  unsubscribedAt: number
  harvestedAt: number
}

export type BanxAdventureBN = {
  publicKey: string
  week: number
  adventureState: BanxAdventureState
  amountOfTokensHarvested: BN
  rewardsToBeDistributed: BN
  tokensPerPoints: BN
  totalBanxSubscribed: number
  totalPartnerPoints: number //? sum of partner points of all subscribed nfts
  totalPlayerPoints: number
  totalTokensStaked: BN
  periodEndingAt: number
  periodStartedAt: number
  placeholderOne: string
}

export type BanxStakeBN = {
  publicKey: string
  user: string
  banxStakeState: BanxTokenStakeState
  banxNftsStakedQuantity: number
  partnerPointsStaked: number
  playerPointsStaked: number
  adventureSubscriptionsQuantity: number
  tokensStaked: BN
  farmedAmount: BN
  stakedAt: number
  unstakedAt: number
  nftsStakedAt: number
  nftsUnstakedAt: number
  placeholderOne: string
}

export type BanxAdventureAndSubscription = {
  adventure: BanxAdventureBN
  adventureSubscription: BanxAdventureSubscriptionBN | null
}

export type BanxAdventureAndSubscriptionArray = ReadonlyArray<BanxAdventureAndSubscription>

export type BanxInfoBN = {
  banxWalletBalance: BN | null
  banxTokenStake: BanxStakeBN | null
  banxAdventures: BanxAdventureAndSubscriptionArray
  nfts: ReadonlyArray<BanxStakeNft> | null
}
