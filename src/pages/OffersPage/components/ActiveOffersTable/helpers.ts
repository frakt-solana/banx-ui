import { chain, maxBy, sortBy } from 'lodash'

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

type IsLoanAbleToTerminate = (props: {
  loan: Loan
  offers: Record<string, Offer[]>
  optimisticOffers: Offer[]
}) => boolean
export const isLoanAbleToTerminate: IsLoanAbleToTerminate = ({
  loan,
  offers,
  optimisticOffers,
}) => {
  const isLoanExpired = isLoanLiquidated(loan)
  const isTerminatingStatus = isLoanTerminating(loan)
  const hasRefinanceOffers = findBestOffer({ loan, offers, optimisticOffers })
  const isLoanUnderWater = isUnderWaterLoan(loan)

  return !isLoanExpired && !isTerminatingStatus && !hasRefinanceOffers && isLoanUnderWater
}

type FindBestOffer = (props: {
  loan: Loan
  offers: Record<string, Offer[]>
  optimisticOffers: Offer[]
}) => Offer

export const findBestOffer: FindBestOffer = ({ loan, offers, optimisticOffers }) => {
  const offersByMarket = offers[loan.fraktBond.hadoMarket || '']
  const combinedOffers = [...optimisticOffers, ...(offersByMarket ?? [])]

  const filteredOffers = chain(combinedOffers)
    .groupBy('publicKey')
    .map((offers) => maxBy(offers, 'lastTransactedAt'))
    .compact()
    .filter((offer) => calculateLoanValue(offer) > calculateLoanRepayValue(loan))
    .value()

  const sortedOffers = sortBy(filteredOffers, 'fundsSolOrTokenBalance')

  return sortedOffers[0]
}
