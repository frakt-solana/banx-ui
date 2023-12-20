import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { chain, first } from 'lodash'
import moment from 'moment'

import { Loan, Offer } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import {
  calcLoanBorrowedAmount,
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
  offers: Offer[]
  walletPubkey: string
}) => boolean
export const isLoanAbleToTerminate: IsLoanAbleToTerminate = ({
  loan,
  offers,
  walletPubkey = '',
}) => {
  const isLoanExpired = isLoanLiquidated(loan)
  const isTerminatingStatus = isLoanTerminating(loan)
  const hasRefinanceOffers = findBestOffer({ loan, offers, walletPubkey })
  const isLoanUnderWater = isUnderWaterLoan(loan)

  return !isLoanExpired && !isTerminatingStatus && !hasRefinanceOffers && isLoanUnderWater
}

type FindBestOffer = (props: { loan: Loan; offers: Offer[]; walletPubkey: string }) => Offer
export const findBestOffer: FindBestOffer = ({ loan, offers, walletPubkey }) => {
  const filteredOffers = chain(offers)
    .filter(
      (offer) =>
        offer.hadoMarket === loan.fraktBond.hadoMarket && offer.assetReceiver !== walletPubkey,
    )
    .filter((offer) => calculateLoanValue(offer) > calculateLoanRepayValue(loan))
    .sortBy((offer) => offer.fundsSolOrTokenBalance)
    .value()

  return first(filteredOffers) as Offer
}

export const calculateLentValue = (loan: Loan) => {
  const totalRepaidAmount = loan.totalRepaidAmount || 0

  const loanBorrowedAmount = calcLoanBorrowedAmount(loan)

  return loanBorrowedAmount + totalRepaidAmount
}

export const calculateClaimValue = (loan: Loan) => {
  const { amountOfBonds, soldAt } = loan.bondTradeTransaction

  const loanBorrowedAmount = calcLoanBorrowedAmount(loan)

  const interestParameters = {
    loanValue: loanBorrowedAmount,
    startTime: soldAt,
    currentTime: moment().unix(),
    rateBasePoints: amountOfBonds + BONDS.PROTOCOL_REPAY_FEE,
  }

  const currentInterest = calculateCurrentInterestSolPure(interestParameters)
  return currentInterest + loanBorrowedAmount
}
