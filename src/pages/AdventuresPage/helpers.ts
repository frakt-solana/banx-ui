import { BN } from 'fbonds-core'
import { BANX_ADVENTURE_GAP } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  calculatePlayerPointsForTokens,
  calculateRewardsFromSubscriptions,
} from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { BanxAdventureSubscriptionState } from 'fbonds-core/lib/fbond-protocol/types'
import { chain } from 'lodash'
import moment from 'moment'

import {
  AdventureStatus,
  BanxAdventureBN,
  BanxAdventureSubscriptionBN,
  BanxStakeBN,
} from '@banx/api/staking'
import { BANX_TOKEN_DECIMALS } from '@banx/constants'
import { ZERO_BN, bnToFixed, bnToHuman } from '@banx/utils'

export const calculateAdventureRewards = (
  params: Array<{ adventure: BanxAdventureBN; subscription?: BanxAdventureSubscriptionBN }>,
): BN => {
  if (!params.length) return ZERO_BN

  const hasSubscriptions = !!params.find(({ subscription }) => !!subscription)

  if (!hasSubscriptions) return ZERO_BN

  const calculateRewardsParams = chain(params)
    .filter(({ subscription }) => !!subscription)
    .map(({ adventure, subscription }) => ({
      subscriptuionStakeTokensAmount: subscription?.stakeTokensAmount ?? ZERO_BN,
      subscriptionStakePartnerPointsAmount: new BN(subscription?.stakePartnerPointsAmount ?? 0),
      adventureTotalPartnerPoints: new BN(adventure.totalPartnerPoints),
      adventureTokensPerPoints: adventure.tokensPerPoints,
      adventureTotalTokensStaked: adventure.totalTokensStaked,
      adventureRewardsToBeDistributed: adventure.rewardsToBeDistributed,
    }))
    .value()

  const amount = calculateRewardsFromSubscriptions(calculateRewardsParams)

  return amount
}

export const calcPartnerPoints = (tokensAmount: BN, tokensPerPartnerPoints?: BN): number => {
  if (!tokensPerPartnerPoints) {
    return 0
  }

  const partnerPoints =
    bnToHuman(tokensAmount, BANX_TOKEN_DECIMALS) /
    bnToHuman(tokensPerPartnerPoints, BANX_TOKEN_DECIMALS)

  return isNaN(partnerPoints) ? 0 : partnerPoints
}

export const checkIsUserStaking = (banxTokenStake: BanxStakeBN) => {
  const { tokensStaked, banxNftsStakedQuantity } = banxTokenStake

  if (!tokensStaked.eq(ZERO_BN) || !banxNftsStakedQuantity) return false

  return true
}

export const checkIsSubscribed = (banxAdventureSubscription: BanxAdventureSubscriptionBN) => {
  const { adventureSubscriptionState, stakeTokensAmount, stakeNftAmount } =
    banxAdventureSubscription

  if (adventureSubscriptionState === BanxAdventureSubscriptionState.None) return false

  if (stakeNftAmount !== 0) return true
  if (!stakeTokensAmount.eq(ZERO_BN)) return true

  return false
}

export const isAdventureStarted = (adventure: BanxAdventureBN): boolean => {
  return adventure.periodStartedAt + BANX_ADVENTURE_GAP < moment().unix()
}

export const isAdventureLive = (adventure: BanxAdventureBN): boolean => {
  const isStarted = isAdventureStarted(adventure)
  const isEnded = isAdventureEnded(adventure)

  return isStarted && !isEnded
}

export const isAdventureEnded = (adventure: BanxAdventureBN): boolean => {
  const endTime = getAdventureEndTime(adventure)

  return endTime < moment().unix()
}

export const isAdventureUpcomming = (adventure: BanxAdventureBN): boolean => {
  const isEnded = isAdventureEnded(adventure)
  const isLive = isAdventureLive(adventure)

  return !isEnded && !isLive
}

export const getAdventureEndTime = (adventure: BanxAdventureBN): number => {
  const isStarted = isAdventureStarted(adventure)

  return isStarted ? adventure.periodEndingAt : adventure.periodStartedAt + BANX_ADVENTURE_GAP
}

export const getAdventureStatus = (adventure: BanxAdventureBN): AdventureStatus => {
  const isEnded = isAdventureEnded(adventure)
  const isLive = isAdventureLive(adventure)

  if (isEnded) {
    return AdventureStatus.ENDED
  }

  if (isLive) {
    return AdventureStatus.LIVE
  }

  return AdventureStatus.UPCOMING
}

export const calculatePlayerPointsForBanxTokens = (tokensStaked: BN): number => {
  const playerPoints = calculatePlayerPointsForTokens(tokensStaked)

  return playerPoints
}

export const banxTokenBNToFixed = (value: BN, fractionDigits = 2) =>
  bnToFixed({ value, fractionDigits, decimals: BANX_TOKEN_DECIMALS })
