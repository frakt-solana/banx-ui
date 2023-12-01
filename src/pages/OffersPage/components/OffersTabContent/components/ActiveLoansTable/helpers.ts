import { first, sortBy } from 'lodash'

import { Loan, Offer } from '@banx/api/core'
import {
  calculateLoanRepayValue,
  calculateLoanValue,
  isLoanLiquidated,
  isLoanTerminating,
  isUnderWaterLoan,
} from '@banx/utils'

type IsLoanAbleToClaim = (loan: Loan) => boolean
export const isLoanAbleToClaim: IsLoanAbleToClaim = (loan) => {
  const isTerminatingStatus = isLoanTerminating(loan)
  const isLoanExpired = isLoanLiquidated(loan)

  return isLoanExpired && isTerminatingStatus
}

type IsLoanAbleToTerminate = (props: { loan: Loan; offers: Offer[] }) => boolean
export const isLoanAbleToTerminate: IsLoanAbleToTerminate = ({ loan, offers }) => {
  const isLoanExpired = isLoanLiquidated(loan)
  const isTerminatingStatus = isLoanTerminating(loan)
  const hasRefinanceOffers = findBestOffer({ loan, offers })
  const isLoanUnderWater = isUnderWaterLoan(loan)

  return !isLoanExpired && !isTerminatingStatus && !hasRefinanceOffers && isLoanUnderWater
}

type FindBestOffer = (props: { loan: Loan; offers: Offer[] }) => Offer

export const findBestOffer: FindBestOffer = ({ loan, offers }) => {
  const marketOffers = offers.filter((offer) => offer.hadoMarket === loan.fraktBond.hadoMarket)

  const filteredOffers = marketOffers.filter(
    (offer) => calculateLoanValue(offer) > calculateLoanRepayValue(loan),
  )

  const sortedOffers = sortBy(filteredOffers, (offer) => offer.fundsSolOrTokenBalance)

  return first(sortedOffers) as Offer
}
