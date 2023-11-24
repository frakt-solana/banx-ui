import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { sumBy } from 'lodash'
import moment from 'moment'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { calcLoanBorrowedAmount } from '@banx/utils'

export const getAdditionalOfferInfo = (loans: Loan[]) => {
  const totalLent = sumBy(loans, calculateLentValue)

  //TODO: replace borrowedAmount to totalRepaidAmount
  const totalRepaid = sumBy(loans, 'borrowedAmount')
  const totalClaim = sumBy(loans, caclulateClaimValue)

  return {
    lent: totalLent,
    repaid: totalRepaid,
    claim: totalClaim,
    apy: 0,
    interest: 0,
  }
}

export const calculateLentValue = (loan: Loan) => {
  const totalRepaidAmount = loan.totalRepaidAmount || 0

  const loanBorrowedAmount = calcLoanBorrowedAmount(loan)

  return loanBorrowedAmount + totalRepaidAmount
}

export const caclulateClaimValue = (loan: Loan) => {
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
