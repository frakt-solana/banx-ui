import { calculateNextSpotPrice } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { getMaxLoanValueFromBondOffer } from 'fbonds-core/lib/fbond-protocol/helpers'
import { PairState } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, uniqueId } from 'lodash'

import { Offer, core } from '@banx/api/nft'

import { SimpleOffer } from './types'

const spreadToSimpleOffers = (offer: core.Offer): SimpleOffer[] => {
  const { baseSpotPrice, mathCounter, buyOrdersQuantity, bondingCurve, bidSettlement, validation } =
    offer

  const baseMathCounterInitial = mathCounter + 1

  const prevSpotPriceInitial = calculateNextSpotPrice({
    bondingCurveType: bondingCurve.bondingType,
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
          bondingCurveType: bondingCurve.bondingType,
          delta: bondingCurve.delta,
          spotPrice: baseSpotPrice,
          counter: baseMathCounter + 1,
        })

        const nextSpotPrice = calculateNextSpotPrice({
          bondingCurveType: bondingCurve.bondingType,
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

type ConvertOffersToSimple = (offers: core.Offer[], sort?: 'desc' | 'asc') => SimpleOffer[]
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

export const сalculateLoansAmount = (offer: core.Offer) => {
  const { fundsSolOrTokenBalance, currentSpotPrice } = offer

  const loansAmount = fundsSolOrTokenBalance / currentSpotPrice

  return loansAmount
}

export const calculateLoanValue = (offer: core.Offer) => {
  return getMaxLoanValueFromBondOffer(offer)
  // const { currentSpotPrice } = offer

  // const loansAmount = сalculateLoansAmount(offer)
  // const loanValue = currentSpotPrice * Math.min(loansAmount, 1)

  // return loanValue
}

export const isOfferStateClosed = (pairState: PairState) => {
  return (
    pairState === PairState.PerpetualClosed ||
    pairState === PairState.PerpetualBondingCurveClosed ||
    pairState === PairState.PerpetualMigrated
  )
}

export const isOfferClosed = (offer: Offer) => {
  const isStateClosed = isOfferStateClosed(offer.pairState)

  return (
    isStateClosed &&
    offer.bidCap === 0 &&
    offer.concentrationIndex === 0 &&
    offer.bidSettlement === 0 &&
    offer.fundsSolOrTokenBalance === 0
  )
}

//? Prevent orders wrong distibution on bulk borrow from same offer
export const offerNeedsReservesOptimizationOnBorrow = (offer: core.Offer, loanValueSum: number) =>
  loanValueSum <= (offer.bidSettlement + offer.buyOrdersQuantity > 0 ? offer.currentSpotPrice : 0)

type FilterOutWalletLoans = (props: { offers: core.Offer[]; walletPubkey?: string }) => core.Offer[]
export const filterOutWalletLoans: FilterOutWalletLoans = ({ offers, walletPubkey }) => {
  if (!walletPubkey) return offers
  return offers.filter((offer) => offer.assetReceiver !== walletPubkey)
}

type FindSuitableOffer = (props: {
  loanValue: number
  offers: core.Offer[]
}) => core.Offer | undefined
export const findSuitableOffer: FindSuitableOffer = ({ loanValue, offers }) => {
  //? Create simple offers array sorted by loanValue (offerValue) asc
  const simpleOffers = convertOffersToSimple(offers, 'asc')

  //? Find offer. OfferValue must be greater than or equal to loanValue
  const simpleOffer = simpleOffers.find(({ loanValue: offerValue }) => loanValue <= offerValue)

  return offers.find(({ publicKey }) => publicKey === simpleOffer?.publicKey)
}

export const isOfferNotEmpty = (offer: core.Offer) => {
  const { fundsSolOrTokenBalance, currentSpotPrice } = offer
  const fullOffersAmount = Math.floor(fundsSolOrTokenBalance / currentSpotPrice)
  if (fullOffersAmount >= 1) return true
  const decimalLoanValue = fundsSolOrTokenBalance - currentSpotPrice * fullOffersAmount
  if (decimalLoanValue > 0) return true
  return false
}

export type NftWithLoanValue = {
  nft: core.BorrowNft
  loanValue: number
}
type NftWithOffer = {
  nft: NftWithLoanValue
  offer: core.Offer
}
type MatchNftsAndOffers = (props: {
  nfts: NftWithLoanValue[]
  rawOffers: core.Offer[]
}) => NftWithOffer[]
/**
 * Recalculates the cart. Matches selected nfts with selected offers
 * to make pairs (nft+offer) as effective as possible.
 */
export const matchNftsAndOffers: MatchNftsAndOffers = ({ nfts, rawOffers }) => {
  //? Create simple offers array sorted by loanValue (offerValue) asc
  const simpleOffers = convertOffersToSimple(rawOffers, 'asc')

  const { nftsWithOffers } = chain(nfts)
    .cloneDeep()
    //? Sort by selected loanValue asc
    .sort((a, b) => {
      return a.loanValue - b.loanValue
    })
    .reduce(
      (acc, nft) => {
        //? Find index of offer. OfferValue must be greater than or equal to selected loanValue. And mustn't be used by prev iteration
        const offerIndex = simpleOffers.findIndex(
          ({ loanValue: offerValue }, idx) => nft.loanValue <= offerValue && acc.offerIndex <= idx,
        )

        const nftAndOffer: NftWithOffer = {
          nft,
          offer: rawOffers.find(
            ({ publicKey }) => publicKey === simpleOffers[offerIndex].publicKey,
          ) as core.Offer,
        }

        return {
          //? Increment offerIndex to use in next iteration (to reduce amount of iterations)
          offerIndex: offerIndex + 1,
          nftsWithOffers: [...acc.nftsWithOffers, nftAndOffer],
        }
      },
      { offerIndex: 0, nftsWithOffers: [] } as {
        offerIndex: number
        nftsWithOffers: NftWithOffer[]
      },
    )
    .value()

  return nftsWithOffers
}
