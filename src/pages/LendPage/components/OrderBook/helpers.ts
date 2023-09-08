import { getPerpetualOfferSize } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'

import { Offer } from '@banx/api/core'

import { Order } from './types'

export const parseMarketOrder = (offer: Offer): Order => {
  const { fundsSolOrTokenBalance, currentSpotPrice, publicKey, assetReceiver, validation } = offer

  const loansAmount = fundsSolOrTokenBalance / currentSpotPrice
  const loanValue = currentSpotPrice * Math.min(loansAmount, 1)

  return {
    loanValue: loanValue / 1e9,
    size: (offer ? getPerpetualOfferSize(offer as BondOfferV2) * currentSpotPrice : 0) / 1e9,
    loansAmount,
    rawData: {
      publicKey,
      assetReceiver,
      bondFeature: validation?.bondFeatures,
      loanToValueFilter: validation?.loanToValueFilter,
    },
  }
}
