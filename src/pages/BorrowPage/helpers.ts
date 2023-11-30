import { calculateNextSpotPrice } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondingCurveType } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, uniqueId } from 'lodash'

import { Offer } from '@banx/api/core'

import { SimpleOffer } from './types'

const spreadToSimpleOffers = (offer: Offer): SimpleOffer[] => {
  const { baseSpotPrice, mathCounter, buyOrdersQuantity, bondingCurve } = offer

  return Array(buyOrdersQuantity)
    .fill(0)
    .map((_, idx) => {
      return {
        id: uniqueId(),
        loanValue: calculateNextSpotPrice({
          bondingCurveType: bondingCurve.bondingType as BondingCurveType,
          delta: bondingCurve.delta,
          spotPrice: baseSpotPrice,
          counter: mathCounter + 1 - idx,
        }),
        hadoMarket: offer.hadoMarket,
        publicKey: offer.publicKey,
      }
    })
}

type ConvertOffersToSimple = (offers: Offer[], sort?: 'desc' | 'asc') => SimpleOffer[]
export const convertOffersToSimple: ConvertOffersToSimple = (offers, sort = 'desc') => {
  return chain(offers)
    .map(spreadToSimpleOffers)
    .flatten()
    .sort((a, b) => {
      if (sort === 'desc') {
        return b.loanValue - a.loanValue
      }
      return a.loanValue - b.loanValue
    })
    .value()
}
