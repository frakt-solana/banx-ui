import { calculateDynamicApr } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { PairState } from 'fbonds-core/lib/fbond-protocol/types'

import { Offer } from '@banx/api/core'
import { DYNAMIC_APR } from '@banx/constants'

export const сalculateLoansAmount = (offer: Offer) => {
  const { fundsSolOrTokenBalance, currentSpotPrice } = offer

  const loansAmount = fundsSolOrTokenBalance / currentSpotPrice

  return loansAmount
}

export const calculateLoanValue = (offer: Offer) => {
  const { currentSpotPrice } = offer

  const loansAmount = сalculateLoansAmount(offer)
  const loanValue = currentSpotPrice * Math.min(loansAmount, 1)

  return loanValue
}

export const isOfferClosed = (pairState: string) => {
  return (
    pairState === PairState.PerpetualClosed ||
    pairState === PairState.PerpetualBondingCurveClosed ||
    pairState === PairState.PerpetualMigrated
  )
}

export const calcDynamicApr = (loanValue: number, collectionFloor: number) => {
  const staticApr = Math.floor((loanValue / collectionFloor) * 1e4) || 0
  return calculateDynamicApr(staticApr, DYNAMIC_APR) / 100
}

//? Prevent orders wrong distibution on bulk borrow from same offer
export const offerNeedsReservesOptimizationOnBorrow = (offer: Offer, loanValueSum: number) =>
  loanValueSum <= (offer.bidSettlement + offer.buyOrdersQuantity > 0 ? offer.currentSpotPrice : 0)
