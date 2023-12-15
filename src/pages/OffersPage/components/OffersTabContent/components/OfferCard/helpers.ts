import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { calcLoanBorrowedAmount } from '@banx/utils'

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
