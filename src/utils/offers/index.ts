import { PairState } from 'fbonds-core/lib/fbond-protocol/types'

import { Offer } from '@banx/api/core'

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
