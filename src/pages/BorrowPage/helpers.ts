import { calculateNextSpotPrice } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondingCurveType } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, uniqueId } from 'lodash'

import { Offer } from '@banx/api/core'

import { SimpleOffer } from './types'

const spreadToSimpleOffers = (offer: Offer): SimpleOffer[] => {
  const {
    baseSpotPrice,
    mathCounter,
    buyOrdersQuantity,
    bondingCurve,
    bidSettlement,
    currentSpotPrice,
    validation,
  } = offer

  if (buyOrdersQuantity === 0) {
    const baseMathCounter = mathCounter + 1

    const prevSpotPrice = calculateNextSpotPrice({
      bondingCurveType: bondingCurve.bondingType as BondingCurveType,
      delta: bondingCurve.delta,
      spotPrice: baseSpotPrice,
      counter: baseMathCounter + 1,
    })
    const loanValue = Math.min(validation.loanToValueFilter, bidSettlement, prevSpotPrice)

    const simpleOffer = {
      id: uniqueId(),
      loanValue,
      hadoMarket: offer.hadoMarket,
      publicKey: offer.publicKey,
    }
    return [simpleOffer]
  }
  const { reserve, simpleOffers: mainOffers, prevSpotPrice } = Array(buyOrdersQuantity)
    .fill(0)
    .reduce(
      (acc: { reserve: number; simpleOffers: SimpleOffer[] }, _, idx) => {
        const baseMathCounter = mathCounter + 1 - idx

        const prevSpotPrice = calculateNextSpotPrice({
          bondingCurveType: bondingCurve.bondingType as BondingCurveType,
          delta: bondingCurve.delta,
          spotPrice: baseSpotPrice,
          counter: baseMathCounter + 1,
        })

        const nextSpotPrice = calculateNextSpotPrice({
          bondingCurveType: bondingCurve.bondingType as BondingCurveType,
          delta: bondingCurve.delta,
          spotPrice: baseSpotPrice,
          counter: baseMathCounter,
        })

        const loanValue = Math.min(
          validation.loanToValueFilter,
          nextSpotPrice + acc.reserve,
          prevSpotPrice,
        )

        const nextReserve = acc.reserve - Math.max(loanValue - nextSpotPrice, 0)

        const simpleOffer = {
          id: uniqueId(),
          loanValue,
          hadoMarket: offer.hadoMarket,
          publicKey: offer.publicKey,
        }

        return {
          reserve: nextReserve,
          simpleOffers: [...acc.simpleOffers, simpleOffer],
          prevSpotPrice,
        }
      },
      { reserve: bidSettlement, simpleOffers: [], prevSpotPrice: currentSpotPrice },
    )

  const reserveDenominator = Math.min(validation.loanToValueFilter, prevSpotPrice);
  const reserveOrdersCount = Math.floor(reserve / reserveDenominator)
  const reserveOffers = Array(reserveOrdersCount)
    .fill(0).map(_ => ({
      id: uniqueId(),
      loanValue: reserveDenominator,
      hadoMarket: offer.hadoMarket,
      publicKey: offer.publicKey,
    }))

  const lastOfferValue = reserve % reserveDenominator;
  const lastOffer = {
    id: uniqueId(),
    loanValue: lastOfferValue,
    hadoMarket: offer.hadoMarket,
    publicKey: offer.publicKey,
  }

  const simpleOffers = [...mainOffers, ...reserveOffers, ...(lastOfferValue > 0 ? [lastOffer] : [])]

  console.log("simpleOffers: ", simpleOffers);
  return simpleOffers
}

type ConvertOffersToSimple = (offers: Offer[], sort?: 'desc' | 'asc') => SimpleOffer[]
export const convertOffersToSimple: ConvertOffersToSimple = (offers, sort = 'desc') => {
  const convertedOffers = chain(offers)
    .map(spreadToSimpleOffers)
    .flatten()
    .sort((a, b) => {
      if (sort === 'desc') {
        return b.loanValue - a.loanValue
      }
      return a.loanValue - b.loanValue
    })
    .value()

  console.log("convertedOffers: ", convertedOffers)
  return convertedOffers
}
