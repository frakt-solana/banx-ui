import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { sumBy } from 'lodash'
import moment from 'moment'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { calcLoanBorrowedAmount, calcWeightedAverage } from '@banx/utils'

export const getAdditionalOfferInfo = (loans: Loan[]) => {
  const collectionFloor = loans[0]?.nft.collectionFloor
  const totalClaimValue = sumBy(loans, calculateClaimValue)

  const ltv = (totalClaimValue / collectionFloor) * 100

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
    apy: weightedApr,
    interest: 0,
    totalLoans: loans.length,
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
