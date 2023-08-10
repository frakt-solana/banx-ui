import { BondOfferV2 } from 'fbonds-core/lib/fbond-protocol/types'
import { getTopOrderSize } from 'fbonds-core/lib/fbond-protocol/utils/cartManagerV2'

import { BondOffer } from '@banx/api/bonds'

import { Order } from './types'

export const parseMarketOrder = (pair: BondOffer): Order => {
  const { fundsSolOrTokenBalance, currentSpotPrice, publicKey, assetReceiver, validation } = pair

  const loansAmount = fundsSolOrTokenBalance / currentSpotPrice
  const loanValue = currentSpotPrice * Math.min(loansAmount, 1)

  return {
    loanValue: loanValue / 1e9,
    size: (pair ? getTopOrderSize(pair as BondOfferV2) * currentSpotPrice : 0) / 1e9,
    loansAmount,
    rawData: {
      publicKey,
      assetReceiver,
      bondFeature: validation?.bondFeatures,
      loanToValueFilter: validation?.loanToValueFilter,
    },
  }
}
