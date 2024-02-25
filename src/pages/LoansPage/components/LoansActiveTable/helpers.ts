import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue } from '@banx/utils'

export const calcAccruedInterest = (loan: Loan) => {
  const { accruedInterest = 0, bondTradeTransaction } = loan
  const { solAmount, feeAmount } = bondTradeTransaction || {}

  const repayValue = calculateLoanRepayValue(loan)
  const totalAccruedInterest = repayValue - solAmount - feeAmount + accruedInterest

  return totalAccruedInterest
}

export const calcUnpaidAccruedInterest = (loan: Loan): number => {
  const totalAccruedInterest = calcAccruedInterest(loan)
  const totalRepaidAmount = loan.totalRepaidAmount || 0

  const unpaidAccruedInterest = Math.max(0, totalAccruedInterest - totalRepaidAmount)
  return unpaidAccruedInterest
}

export const caclFractionToRepay = (loan: Loan) => {
  const repayValue = calculateLoanRepayValue(loan)
  const percentToRepay = calcUnpaidAccruedInterest(loan) / repayValue

  return Math.floor(percentToRepay * 1e4)
}
