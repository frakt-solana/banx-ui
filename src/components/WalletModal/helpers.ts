import { BN } from 'fbonds-core'
import { BANX_SOL_STAKING_YEILD_APR } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  calculateBanxSolStakingRewards,
  calculateCurrentInterestSolPure,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { sumBy } from 'lodash'
import moment from 'moment'

import { ClusterStats } from '@banx/api/common'
import { core } from '@banx/api/nft'
import { isOfferStateClosed } from '@banx/utils'

export const getLenderVaultInfo = (
  offers: core.UserOffer[],
  clusterStats: ClusterStats | undefined,
) => {
  const { slot = 0, epochStartedAt = 0 } = clusterStats || {}

  const closedOffers = offers.filter(({ offer }) => isOfferStateClosed(offer.pairState))

  const totalAccruedInterest = sumBy(offers, ({ offer }) => offer.concentrationIndex)
  const totalRepaymets = sumBy(offers, ({ offer }) => offer.bidCap)

  const totalClosedOffersValue = sumBy(
    closedOffers,
    ({ offer }) => offer.fundsSolOrTokenBalance + offer.bidSettlement,
  )

  const totalLstYield = sumBy(offers, ({ offer }) =>
    calculateLstYield({ offer, slot, epochStartedAt }).toNumber(),
  )

  const totalLiquidityValue = totalAccruedInterest + totalRepaymets + totalClosedOffersValue
  const totalClaimableValue = totalLiquidityValue + totalLstYield

  const totalFundsInCurrentEpoch = sumBy(offers, ({ offer }) =>
    calculateYieldInCurrentEpoch(offer, clusterStats),
  )

  const totalFundsInNextEpoch = sumBy(offers, ({ offer }) =>
    calculateYieldInNextEpoch(offer, clusterStats),
  )

  return {
    totalAccruedInterest,
    totalRepaymets,
    totalClosedOffersValue,
    totalLiquidityValue,
    totalLstYield,
    totalClaimableValue,
    totalFundsInCurrentEpoch,
    totalFundsInNextEpoch,
  }
}

type CalculateLstYield = (props: { offer: core.Offer; slot: number; epochStartedAt: number }) => BN
const calculateLstYield: CalculateLstYield = ({ offer, slot, epochStartedAt }) => {
  const totalYield = calculateBanxSolStakingRewards({
    bondOffer: offer,
    nowSlot: new BN(slot),
    currentEpochStartAt: new BN(epochStartedAt),
  })

  return totalYield
}

export const calculateYieldInCurrentEpoch = (
  offer: core.Offer,
  clusterStats: ClusterStats | undefined,
) => {
  const {
    epochApproxTimeRemaining = 0,
    epochStartedAt = 0,
    epoch = 0,
    slotsInEpoch = 0,
  } = clusterStats || {}

  const lastEpochWhenOfferChanged = offer.lastCalculatedSlot / slotsInEpoch

  const loanValue =
    lastEpochWhenOfferChanged < epoch
      ? offer.fundsInCurrentEpoch + offer.fundsInNextEpoch
      : offer.fundsInCurrentEpoch

  const currentTimeInUnix = moment().unix()
  const currentTime = currentTimeInUnix + epochApproxTimeRemaining

  return calculateCurrentInterestSolPure({
    loanValue,
    startTime: epochStartedAt,
    currentTime,
    rateBasePoints: BANX_SOL_STAKING_YEILD_APR,
  })
}

export const calculateYieldInNextEpoch = (
  offer: core.Offer,
  clusterStats: ClusterStats | undefined,
) => {
  const { epochApproxTimeRemaining = 0, epochDuration = 0 } = clusterStats || {}

  const currentTimeInUnix = moment().unix()
  const epochStartedAt = currentTimeInUnix + epochApproxTimeRemaining

  return calculateCurrentInterestSolPure({
    loanValue: offer.fundsInCurrentEpoch + offer.fundsInNextEpoch,
    startTime: epochStartedAt,
    currentTime: epochStartedAt + epochDuration,
    rateBasePoints: BANX_SOL_STAKING_YEILD_APR,
  })
}
