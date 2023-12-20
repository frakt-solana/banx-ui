import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { chain, first, sumBy } from 'lodash'
import moment from 'moment'

import { Loan, Offer } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import {
  calcLoanBorrowedAmount,
  calcWeightedAverage,
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

export const getAdditionalOfferInfo = ({ loans, offer }: { loans: Loan[]; offer: Offer }) => {
  const { buyOrdersQuantity } = offer

  const collectionFloor = loans[0]?.nft.collectionFloor
  const totalClaimValue = sumBy(loans, calculateClaimValue)

  const activeLoansQuantity = loans?.length || 0
  const totalLoansQuantity = activeLoansQuantity + buyOrdersQuantity

  const interest = offer.concentrationIndex

  const ltv = (totalClaimValue / loans.length / collectionFloor) * 100

  const weightedApr = calcWeightedAverage(
    loans.map((loan) => loan.bondTradeTransaction.amountOfBonds / 100),
    loans.map((loan) => loan.fraktBond.borrowedAmount),
  )

  const totalLent = sumBy(loans, calculateLentValue)
  const totalClaim = sumBy(loans, calculateClaimValue)
  const totalRepaid = sumBy(loans, ({ totalRepaidAmount = 0 }) => totalRepaidAmount)

  return {
    lent: totalLent,
    repaid: totalRepaid,
    claim: totalClaim,
    ltv,
    apr: weightedApr,
    interest,
    totalLoansQuantity,
    activeLoansQuantity,
  }
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
