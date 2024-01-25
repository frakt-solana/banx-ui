import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue } from '@banx/utils'

export const calculateRepaymentStaticValues = (loan: Loan) => {
  const repaymentCallAmount = loan.repaymentCall?.callAmount || 0

  const totalClaim = calculateLoanRepayValue(loan)

  const DEFAULT_REPAY_PERCENT = 50
  const initialRepayPercent = repaymentCallAmount
    ? (repaymentCallAmount / totalClaim) * 100
    : DEFAULT_REPAY_PERCENT

  const initialRepayValue = repaymentCallAmount
    ? repaymentCallAmount
    : totalClaim * (initialRepayPercent / 100)

  return {
    repaymentCallExists: !!repaymentCallAmount,
    totalClaim,
    initialRepayPercent,
    initialRepayValue,
  }
}
