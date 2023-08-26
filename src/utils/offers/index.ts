import { Offer } from '@banx/api/core'

export const caclulateLoansAmount = (offer: Offer) => {
  const { fundsSolOrTokenBalance, currentSpotPrice } = offer

  const loansAmount = fundsSolOrTokenBalance / currentSpotPrice

  return loansAmount
}

export const calculateLoanValue = (offer: Offer) => {
  const { currentSpotPrice } = offer

  const loansAmount = caclulateLoansAmount(offer)
  const loanValue = currentSpotPrice * Math.min(loansAmount, 1)

  return loanValue
}
