import { calculateNextSpotPrice } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { getMaxLoanValueFromBondOffer } from 'fbonds-core/lib/fbond-protocol/helpers'
import { BondOfferV2, BondingCurveType, PairState } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, uniqueId } from 'lodash'

import { Offer } from '@banx/api/core'

import { SimpleOffer } from './types'

const spreadToSimpleOffers = (offer: Offer): SimpleOffer[] => {
  const { baseSpotPrice, mathCounter, buyOrdersQuantity, bondingCurve, bidSettlement, validation } =
    offer

  const baseMathCounterInitial = mathCounter + 1

  const prevSpotPriceInitial = calculateNextSpotPrice({
    bondingCurveType: bondingCurve.bondingType as BondingCurveType,
    delta: bondingCurve.delta,
    spotPrice: baseSpotPrice,
    counter: baseMathCounterInitial + 1,
  })
  // if (buyOrdersQuantity === 0) {
  //   const baseMathCounter = mathCounter + 1

  //   const loanValue = Math.min(validation.loanToValueFilter, bidSettlement, prevSpotPrice)

  //   const simpleOffer = {
  //     id: uniqueId(),
  //     loanValue,
  //     hadoMarket: offer.hadoMarket,
  //     publicKey: offer.publicKey,
  //   }
  //   return [simpleOffer]
  // }
  const {
    reserve,
    simpleOffers: mainOffers,
    prevSpotPrice,
  } = Array(buyOrdersQuantity)
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
          prevSpotPrice: nextSpotPrice,
        }
      },
      { reserve: bidSettlement, simpleOffers: [], prevSpotPrice: prevSpotPriceInitial },
    )

  const reserveDenominator = Math.min(validation.loanToValueFilter, prevSpotPrice)
  const reserveOrdersCount = reserveDenominator > 0 ? Math.floor(reserve / reserveDenominator) : 0
  const reserveOffers =
    reserveOrdersCount > 0
      ? Array(reserveOrdersCount)
          .fill(0)
          .map(() => ({
            id: uniqueId(),
            loanValue: reserveDenominator,
            hadoMarket: offer.hadoMarket,
            publicKey: offer.publicKey,
          }))
      : []

  const lastOfferValue = reserve % reserveDenominator
  const lastOffer = {
    id: uniqueId(),
    loanValue: lastOfferValue,
    hadoMarket: offer.hadoMarket,
    publicKey: offer.publicKey,
  }

  const simpleOffers = [...mainOffers, ...reserveOffers, ...(lastOfferValue > 0 ? [lastOffer] : [])]

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

  return convertedOffers
}

export const сalculateLoansAmount = (offer: Offer) => {
  const { fundsSolOrTokenBalance, currentSpotPrice } = offer

  const loansAmount = fundsSolOrTokenBalance / currentSpotPrice

  return loansAmount
}

export const calculateLoanValue = (offer: Offer) => {
  return getMaxLoanValueFromBondOffer(offer as BondOfferV2)
  // const { currentSpotPrice } = offer

  // const loansAmount = сalculateLoansAmount(offer)
  // const loanValue = currentSpotPrice * Math.min(loansAmount, 1)

  // return loanValue
}

export const isOfferClosed = (pairState: string) => {
  return (
    pairState === PairState.PerpetualClosed ||
    pairState === PairState.PerpetualBondingCurveClosed ||
    pairState === PairState.PerpetualMigrated
  )
}

//? Prevent orders wrong distibution on bulk borrow from same offer
export const offerNeedsReservesOptimizationOnBorrow = (offer: Offer, loanValueSum: number) =>
  loanValueSum <= (offer.bidSettlement + offer.buyOrdersQuantity > 0 ? offer.currentSpotPrice : 0)

type FindSuitableOffer = (props: {
  loanValue: number
  offers: Offer[]
  walletPubkey: string
}) => Offer | undefined
export const findSuitableOffer: FindSuitableOffer = ({ loanValue, offers, walletPubkey }) => {
  //? Filter out users offers
  const fiteredOffers = offers.filter((offer) => offer.assetReceiver !== walletPubkey)

  //? Create simple offers array sorted by loanValue (offerValue) asc
  const simpleOffers = convertOffersToSimple(fiteredOffers, 'asc')

  //? Find offer. OfferValue must be greater than or equal to loanValue
  const simpleOffer = simpleOffers.find(({ loanValue: offerValue }) => loanValue <= offerValue)

  return offers.find(({ publicKey }) => publicKey === simpleOffer?.publicKey)
}
