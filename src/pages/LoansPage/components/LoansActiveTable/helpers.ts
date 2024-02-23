import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue } from '@banx/utils'

export const calcAccruedInterest = (loan: Loan) => {
  const { accruedInterest = 0, bondTradeTransaction } = loan
  const { solAmount, feeAmount } = bondTradeTransaction || {}

  const repayValue = calculateLoanRepayValue(loan)
  const totalAccruedInterest = repayValue - solAmount - feeAmount + accruedInterest

  return totalAccruedInterest
}
