import { BN } from 'fbonds-core'
import { calculateNextSpotPriceBN } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { getMaxLoanValueFromBondOfferBN } from 'fbonds-core/lib/fbond-protocol/helpers'
import { PairState } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, uniqueId } from 'lodash'

import { coreNew } from '@banx/api/nft'
import { ONE_BN, ZERO_BN } from '@banx/utils/bn'

import { SimpleOffer } from './types'

const spreadToSimpleOffers = (offer: coreNew.Offer): SimpleOffer[] => {
  const { baseSpotPrice, mathCounter, buyOrdersQuantity, bondingCurve, bidSettlement, validation } =
    offer

  const baseMathCounterInitial = mathCounter.add(new BN(1))

  const prevSpotPriceInitial = calculateNextSpotPriceBN({
    bondingCurveType: bondingCurve.bondingType,
    delta: bondingCurve.delta,
    spotPrice: baseSpotPrice,
    counter: baseMathCounterInitial.add(ONE_BN),
  })

  const {
    reserve,
    simpleOffers: mainOffers,
    prevSpotPrice,
  } = Array(buyOrdersQuantity.toNumber())
    .fill(0)
    .reduce(
      (acc: { reserve: BN; simpleOffers: SimpleOffer[] }, _, idx) => {
        const baseMathCounter = mathCounter.add(ONE_BN).sub(new BN(idx))

        const prevSpotPrice = calculateNextSpotPriceBN({
          bondingCurveType: bondingCurve.bondingType,
          delta: bondingCurve.delta,
          spotPrice: baseSpotPrice,
          counter: baseMathCounter.add(ONE_BN),
        })

        const nextSpotPrice = calculateNextSpotPriceBN({
          bondingCurveType: bondingCurve.bondingType,
          delta: bondingCurve.delta,
          spotPrice: baseSpotPrice,
          counter: baseMathCounter,
        })

        const loanValue = BN.min(
          validation.loanToValueFilter,
          BN.min(nextSpotPrice.add(acc.reserve), prevSpotPrice),
        )

        const nextReserve = acc.reserve.sub(BN.max(loanValue.sub(nextSpotPrice), ZERO_BN))

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

  const reserveDenominator = BN.min(validation.loanToValueFilter, prevSpotPrice)
  const reserveOrdersCount = reserveDenominator.gt(ZERO_BN)
    ? reserve.div(reserveDenominator)
    : ZERO_BN
  const reserveOffers = reserveOrdersCount.gt(ZERO_BN)
    ? Array(reserveOrdersCount)
        .fill(ZERO_BN)
        .map(() => ({
          id: uniqueId(),
          loanValue: reserveDenominator,
          hadoMarket: offer.hadoMarket,
          publicKey: offer.publicKey,
        }))
    : []

  const lastOfferValue = reserve.mod(reserveDenominator)
  const lastOffer = {
    id: uniqueId(),
    loanValue: lastOfferValue,
    hadoMarket: offer.hadoMarket,
    publicKey: offer.publicKey,
  }

  const simpleOffers = [
    ...mainOffers,
    ...reserveOffers,
    ...(lastOfferValue.gt(ZERO_BN) ? [lastOffer] : []),
  ]

  return simpleOffers
}

type ConvertOffersToSimple = (offers: coreNew.Offer[], sort?: 'desc' | 'asc') => SimpleOffer[]
export const convertOffersToSimple: ConvertOffersToSimple = (offers, sort = 'desc') => {
  const convertedOffers = chain(offers)
    .map(spreadToSimpleOffers)
    .flatten()
    .sort((a, b) => {
      const res = a.loanValue.sub(b.loanValue)

      if (sort === 'desc') {
        if (res.gt(ZERO_BN)) return -1
        if (res.lt(ZERO_BN)) return 1
        return 0
      }

      if (res.gt(ZERO_BN)) return 1
      if (res.lt(ZERO_BN)) return -1
      return 0
    })
    .value()

  return convertedOffers
}

export const сalculateLoansAmount = (offer: coreNew.Offer) => {
  const { fundsSolOrTokenBalance, currentSpotPrice } = offer

  const loansAmount = fundsSolOrTokenBalance.div(currentSpotPrice)

  return loansAmount
}

export const calculateLoanValue = (offer: coreNew.Offer) => {
  return getMaxLoanValueFromBondOfferBN(offer)
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

export const isOfferClosed = (offer: coreNew.Offer) => {
  const isStateClosed = isOfferStateClosed(offer.pairState)

  return (
    isStateClosed &&
    offer.bidCap.eq(ZERO_BN) &&
    offer.concentrationIndex.eq(ZERO_BN) &&
    offer.bidSettlement.eq(ZERO_BN) &&
    offer.fundsSolOrTokenBalance.eq(ZERO_BN)
  )
}

//? Prevent orders wrong distibution on bulk borrow from same offer
export const offerNeedsReservesOptimizationOnBorrow = (offer: coreNew.Offer, loanValueSum: BN) => {
  const isOfferNotEmpty = offer.bidSettlement.add(offer.buyOrdersQuantity).gt(ZERO_BN)

  return loanValueSum.lte(isOfferNotEmpty ? offer.currentSpotPrice : ZERO_BN)
}

type FilterOutWalletLoans = (props: {
  offers: coreNew.Offer[]
  walletPubkey?: string
}) => coreNew.Offer[]
export const filterOutWalletLoans: FilterOutWalletLoans = ({ offers, walletPubkey }) => {
  if (!walletPubkey) return offers
  return offers.filter((offer) => offer.assetReceiver.toBase58() === walletPubkey)
}

type FindSuitableOffer = (props: {
  loanValue: BN
  offers: coreNew.Offer[]
}) => coreNew.Offer | undefined
export const findSuitableOffer: FindSuitableOffer = ({ loanValue, offers }) => {
  //? Create simple offers array sorted by loanValue (offerValue) asc
  const simpleOffers = convertOffersToSimple(offers, 'asc')

  //? Find offer. OfferValue must be greater than or equal to loanValue
  const simpleOffer = simpleOffers.find(({ loanValue: offerValue }) => loanValue.lte(offerValue))

  return simpleOffer
    ? offers.find(({ publicKey }) => publicKey.equals(simpleOffer.publicKey))
    : undefined
}

export const isOfferNotEmpty = (offer: coreNew.Offer) => {
  const { fundsSolOrTokenBalance, currentSpotPrice } = offer
  const fullOffersAmount = fundsSolOrTokenBalance.div(currentSpotPrice)
  if (fullOffersAmount.gte(ONE_BN)) return true
  const decimalLoanValue = fundsSolOrTokenBalance.sub(currentSpotPrice.mul(fullOffersAmount))
  if (decimalLoanValue.gt(ZERO_BN)) return true
  return false
}

export type NftWithLoanValue = {
  nft: coreNew.BorrowNft
  loanValue: BN
}
type NftWithOffer = {
  nft: NftWithLoanValue
  offer: coreNew.Offer
}
type MatchNftsAndOffers = (props: {
  nfts: NftWithLoanValue[]
  rawOffers: coreNew.Offer[]
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
      const res = a.loanValue.sub(b.loanValue)

      if (res.gt(ZERO_BN)) return 1
      if (res.lt(ZERO_BN)) return -1
      return 0
    })
    .reduce(
      (acc, nft) => {
        //? Find index of offer. OfferValue must be greater than or equal to selected loanValue. And mustn't be used by prev iteration
        const offerIndex = simpleOffers.findIndex(
          ({ loanValue: offerValue }, idx) =>
            nft.loanValue.lte(offerValue) && acc.offerIndex <= idx,
        )

        const nftAndOffer: NftWithOffer = {
          nft,
          offer: rawOffers.find(
            ({ publicKey }) => publicKey === simpleOffers[offerIndex].publicKey,
          ) as coreNew.Offer,
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
