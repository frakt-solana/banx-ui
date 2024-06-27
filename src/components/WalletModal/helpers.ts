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

  const totalLstYeild = sumBy(offers, ({ offer }) =>
    calculateLstYield({ offer, slot, epochStartedAt }).toNumber(),
  )

  const totalClaimableValue =
    totalAccruedInterest + totalRepaymets + totalClosedOffersValue + totalLstYeild

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
    totalClaimableValue,
    totalLstYeild,
    totalFundsInCurrentEpoch,
    totalFundsInNextEpoch,
  }
}

type CalculateLstYield = (props: { offer: core.Offer; slot: number; epochStartedAt: number }) => BN
const calculateLstYield: CalculateLstYield = ({ offer, slot, epochStartedAt }) => {
  return calculateBanxSolStakingRewards({
    bondOffer: offer,
    nowSlot: new BN(slot),
    currentEpochStartAt: new BN(epochStartedAt),
  })
}

export const calculateYieldInCurrentEpoch = (
  offer: core.Offer,
  clusterStats: ClusterStats | undefined,
) => {
  const { epochApproxTimeRemaining = 0, epochStartedAt = 0 } = clusterStats || {}

  const currentTimeInUnix = moment().unix()
  const currentTime = currentTimeInUnix + epochApproxTimeRemaining

  return calculateCurrentInterestSolPure({
    loanValue: offer.fundsInCurrentEpoch,
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
    loanValue: offer.fundsInNextEpoch,
    startTime: epochStartedAt,
    currentTime: epochStartedAt + epochDuration,
    rateBasePoints: BANX_SOL_STAKING_YEILD_APR,
  })
}
