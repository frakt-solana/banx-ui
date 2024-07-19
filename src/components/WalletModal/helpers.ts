import { BN } from 'fbonds-core'
import { BANX_SOL_STAKING_YEILD_APR } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  calculateBanxSolStakingRewards,
  calculateCurrentInterestSolPure,
  calculateCurrentInterestSolPureBN,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { sumBy } from 'lodash'
import moment from 'moment'

import { ClusterStats } from '@banx/api/common'
import { coreNew } from '@banx/api/nft'
import { isOfferStateClosed } from '@banx/utils'

export const getLenderVaultInfo = (
  offers: coreNew.UserOffer[],
  clusterStats: ClusterStats | undefined,
) => {
  const { slot = 0, epochStartedAt = 0 } = clusterStats || {}

  const closedOffers = offers.filter(({ offer }) => isOfferStateClosed(offer.pairState))

  const totalAccruedInterest = sumBy(offers, ({ offer }) => offer.concentrationIndex.toNumber())
  const totalRepaymets = sumBy(offers, ({ offer }) => offer.bidCap.toNumber())

  const totalClosedOffersValue = sumBy(closedOffers, ({ offer }) =>
    offer.fundsSolOrTokenBalance.add(offer.bidSettlement).toNumber(),
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
    calculateYieldInNextEpoch(offer, clusterStats).toNumber(),
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

type CalculateLstYield = (props: {
  offer: coreNew.Offer
  slot: number
  epochStartedAt: number
}) => BN
const calculateLstYield: CalculateLstYield = ({ offer, slot, epochStartedAt }) => {
  const totalYield = calculateBanxSolStakingRewards({
    bondOffer: offer,
    nowSlot: new BN(slot),
    currentEpochStartAt: new BN(epochStartedAt),
  })

  return totalYield
}

export const calculateYieldInCurrentEpoch = (
  offer: coreNew.Offer,
  clusterStats: ClusterStats | undefined,
) => {
  const {
    epochApproxTimeRemaining = 0,
    epochStartedAt = 0,
    epoch = 0,
    slotsInEpoch = 0,
  } = clusterStats || {}

  const epochWhenOfferChanged = offer.lastCalculatedSlot.toNumber() / slotsInEpoch

  const loanValue =
    epochWhenOfferChanged < epoch
      ? offer.fundsInCurrentEpoch.add(offer.fundsInNextEpoch)
      : offer.fundsInCurrentEpoch

  const currentTimeInUnix = moment().unix()
  const epochEndedAt = currentTimeInUnix + epochApproxTimeRemaining

  return calculateCurrentInterestSolPure({
    loanValue: loanValue.toNumber(),
    startTime: epochStartedAt,
    currentTime: epochEndedAt,
    rateBasePoints: BANX_SOL_STAKING_YEILD_APR,
  })
}

export const calculateYieldInNextEpoch = (
  offer: coreNew.Offer,
  clusterStats: ClusterStats | undefined,
) => {
  const { epochApproxTimeRemaining = 0, epochDuration = 0 } = clusterStats || {}

  const currentTimeInUnix = moment().unix()
  const epochStartedAt = currentTimeInUnix + epochApproxTimeRemaining

  return calculateCurrentInterestSolPureBN({
    loanValue: offer.fundsInCurrentEpoch.add(offer.fundsInNextEpoch),
    startTime: new BN(epochStartedAt),
    currentTime: new BN(epochStartedAt + epochDuration),
    rateBasePoints: new BN(BANX_SOL_STAKING_YEILD_APR),
  })
}
