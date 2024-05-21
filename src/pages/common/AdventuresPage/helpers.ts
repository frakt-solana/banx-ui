import { BN } from 'fbonds-core'
import { BANX_ADVENTURE_GAP } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  calculatePlayerPointsForTokens,
  calculateRewardsFromSubscriptions,
} from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { chain } from 'lodash'
import moment from 'moment'

import { staking } from '@banx/api/common'
import { BANX_TOKEN_DECIMALS } from '@banx/constants'
import { ZERO_BN, bnToFixed, bnToHuman } from '@banx/utils'

export const calculateAdventureRewards = (
  params: Array<{
    adventure: staking.BanxAdventureBN
    subscription?: staking.BanxAdventureSubscriptionBN
  }>,
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

export const checkIsUserStaking = (banxTokenStake: staking.BanxStakeBN) => {
  const { tokensStaked, banxNftsStakedQuantity } = banxTokenStake

  if (!tokensStaked.eq(ZERO_BN)) return true
  if (banxNftsStakedQuantity > 0) return true

  return false
}

export const checkIsSubscribed = (
  banxAdventureSubscription: staking.BanxAdventureSubscriptionBN,
) => {
  const { stakeTokensAmount, stakeNftAmount } = banxAdventureSubscription

  if (stakeNftAmount !== 0) return true
  if (!stakeTokensAmount.eq(ZERO_BN)) return true

  return false
}

export const isAdventureStarted = (adventure: staking.BanxAdventureBN): boolean => {
  return adventure.periodStartedAt + BANX_ADVENTURE_GAP < moment().unix()
}

export const isAdventureLive = (adventure: staking.BanxAdventureBN): boolean => {
  const isStarted = isAdventureStarted(adventure)
  const isEnded = isAdventureEnded(adventure)

  return isStarted && !isEnded
}

export const isAdventureEnded = (adventure: staking.BanxAdventureBN): boolean => {
  const endTime = getAdventureEndTime(adventure)

  return endTime < moment().unix()
}

export const isAdventureUpcomming = (adventure: staking.BanxAdventureBN): boolean => {
  const isEnded = isAdventureEnded(adventure)
  const isLive = isAdventureLive(adventure)

  return !isEnded && !isLive
}

export const getAdventureEndTime = (adventure: staking.BanxAdventureBN): number => {
  const isStarted = isAdventureStarted(adventure)

  return isStarted ? adventure.periodEndingAt : adventure.periodStartedAt + BANX_ADVENTURE_GAP
}

export const getAdventureStatus = (adventure: staking.BanxAdventureBN): staking.AdventureStatus => {
  const isEnded = isAdventureEnded(adventure)
  const isLive = isAdventureLive(adventure)

  if (isEnded) {
    return staking.AdventureStatus.ENDED
  }

  if (isLive) {
    return staking.AdventureStatus.LIVE
  }

  return staking.AdventureStatus.UPCOMING
}

export const calculatePlayerPointsForBanxTokens = (tokensStaked: BN): number => {
  const playerPoints = calculatePlayerPointsForTokens(tokensStaked)

  return playerPoints
}

export const banxTokenBNToFixed = (value: BN, fractionDigits = 2) =>
  bnToFixed({ value, fractionDigits, decimals: BANX_TOKEN_DECIMALS })
