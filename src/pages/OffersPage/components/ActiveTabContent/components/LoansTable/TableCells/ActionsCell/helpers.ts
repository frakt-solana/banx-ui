import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue } from '@banx/utils'

export const calculateRepaymentStaticValues = (loan: Loan) => {
  const totalClaim = calculateLoanRepayValue(loan)

  const repaymentCallExists = !!loan.repaymentCall?.callAmount

  const DEFAULT_REPAY_PERCENT = 50
  const initialRepayPercent = repaymentCallExists
    ? ((loan.repaymentCall?.callAmount || 0) / totalClaim) * 100
    : DEFAULT_REPAY_PERCENT

  const initialRepayValue = repaymentCallExists
    ? loan.repaymentCall?.callAmount || 0
    : totalClaim * (initialRepayPercent / 100)

  return {
    repaymentCallExists,
    totalClaim,
    initialRepayPercent,
    initialRepayValue,
  }
}
