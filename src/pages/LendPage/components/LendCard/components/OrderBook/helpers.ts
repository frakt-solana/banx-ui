import { getTopOrderSize } from 'fbonds-core/lib/fbond-protocol/utils/cartManagerV2'

import { MarketOrder } from './types'

export const parseMarketOrder = (pair: any): MarketOrder => {
  const {
    fundsSolOrTokenBalance,
    buyOrdersQuantity,
    currentSpotPrice,
    publicKey,
    assetReceiver,
    validation,
  } = pair

  return {
    loanValue: fundsSolOrTokenBalance / 1e9,
    size: (pair ? getTopOrderSize(pair) * currentSpotPrice : 0) / 1e9,
    loansAmount: buyOrdersQuantity,
    rawData: {
      publicKey,
      assetReceiver,
      bondFeature: validation?.bondFeatures,
      loanToValueFilter: validation?.loanToValueFilter,
    },
  }
}
