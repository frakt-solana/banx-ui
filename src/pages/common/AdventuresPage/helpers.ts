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
    adventure: staking.BanxAdventure
    subscription?: staking.BanxAdventureSubscription
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
      adventureRewardsToBeDistributed: adventure.rewardsToBeDistributed.mul(
        new BN(10 ** BANX_TOKEN_DECIMALS),
      ),
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

export const checkIsUserStaking = (banxTokenStake: staking.BanxTokenStake) => {
  const { tokensStaked, banxNftsStakedQuantity } = banxTokenStake

  if (!tokensStaked.eq(ZERO_BN)) return true
  if (banxNftsStakedQuantity.gt(ZERO_BN)) return true

  return false
}

export const checkIsSubscribed = (banxAdventureSubscription: staking.BanxAdventureSubscription) => {
  const { stakeTokensAmount, stakeNftAmount } = banxAdventureSubscription

  if (!stakeNftAmount.eq(ZERO_BN)) return true
  if (!stakeTokensAmount.eq(ZERO_BN)) return true

  return false
}

export const isAdventureStarted = (adventure: staking.BanxAdventure): boolean => {
  return adventure.periodStartedAt.toNumber() + BANX_ADVENTURE_GAP < moment().unix()
}

export const isAdventureLive = (adventure: staking.BanxAdventure): boolean => {
  const isStarted = isAdventureStarted(adventure)
  const isEnded = isAdventureEnded(adventure)

  return isStarted && !isEnded
}

export const isAdventureEnded = (adventure: staking.BanxAdventure): boolean => {
  const endTime = getAdventureEndTime(adventure)

  return endTime < moment().unix()
}

export const isAdventureUpcomming = (adventure: staking.BanxAdventure): boolean => {
  const isEnded = isAdventureEnded(adventure)
  const isLive = isAdventureLive(adventure)

  return !isEnded && !isLive
}

export const getAdventureEndTime = (adventure: staking.BanxAdventure): number => {
  const isStarted = isAdventureStarted(adventure)

  return isStarted
    ? adventure.periodEndingAt.toNumber()
    : adventure.periodStartedAt.toNumber() + BANX_ADVENTURE_GAP
}

export const getAdventureStatus = (adventure: staking.BanxAdventure): staking.AdventureStatus => {
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
