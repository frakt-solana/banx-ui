import { BN } from 'fbonds-core'
import { calculateBanxSolStakingRewards } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { sumBy } from 'lodash'

import { ClusterStats } from '@banx/api/common'
import { core } from '@banx/api/nft'
import { isOfferStateClosed } from '@banx/utils'

export const getSummaryInfo = (
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

  return {
    totalAccruedInterest,
    totalRepaymets,
    totalClosedOffersValue,
    totalClaimableValue,
    totalLstYeild,
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
