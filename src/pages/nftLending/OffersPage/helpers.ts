import { chain, first } from 'lodash'

import { core } from '@banx/api/nft'
import {
  calculateBorrowedAmount,
  calculateLoanRepayValue,
  calculateLoanValue,
  isLoanLiquidated,
  isLoanTerminating,
} from '@banx/utils'

type IsLoanAbleToClaim = (loan: core.Loan) => boolean
export const isLoanAbleToClaim: IsLoanAbleToClaim = (loan) => {
  const isTerminatingStatus = isLoanTerminating(loan)
  const isLoanExpired = isLoanLiquidated(loan)

  return isLoanExpired && isTerminatingStatus
}

type IsLoanAbleToTerminate = (loan: core.Loan) => boolean
export const isLoanAbleToTerminate: IsLoanAbleToTerminate = (loan) => {
  const isLoanExpired = isLoanLiquidated(loan)
  const isTerminatingStatus = isLoanTerminating(loan)

  return !isLoanExpired && !isTerminatingStatus
}

type FindBestOffer = (props: {
  loan: core.Loan
  offers: core.Offer[]
  walletPubkey: string
}) => core.Offer
export const findBestOffer: FindBestOffer = ({ loan, offers, walletPubkey }) => {
  const filteredOffers = chain(offers)
    .filter(
      (offer) =>
        offer.hadoMarket === loan.fraktBond.hadoMarket && offer.assetReceiver !== walletPubkey,
    )
    .filter((offer) => calculateLoanValue(offer) > calculateLoanRepayValue(loan))
    .sortBy((offer) => offer.fundsSolOrTokenBalance)
    .value()

  return first(filteredOffers) as core.Offer
}

export const calculateLentValue = (loan: core.Loan) => {
  const totalRepaidAmount = loan.totalRepaidAmount || 0

  const loanBorrowedAmount = calculateBorrowedAmount(loan).toNumber()

  return loanBorrowedAmount + totalRepaidAmount
}
