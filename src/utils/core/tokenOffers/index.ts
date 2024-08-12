import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'

import { ZERO_BN } from '@banx/utils/bn'

import { isOfferStateClosed } from '../offers'

export const isTokenOfferClosed = (offer: BondOfferV3) => {
  const isStateClosed = isOfferStateClosed(offer.pairState)

  return (
    isStateClosed &&
    offer.bidCap.eq(ZERO_BN) &&
    offer.concentrationIndex.eq(ZERO_BN) &&
    offer.bidSettlement.eq(ZERO_BN) &&
    offer.fundsSolOrTokenBalance.eq(ZERO_BN)
  )
}
