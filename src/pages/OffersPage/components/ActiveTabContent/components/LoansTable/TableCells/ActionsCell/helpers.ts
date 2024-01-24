import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue } from '@banx/utils'

export const calculateRepaymentStaticValues = (loan: Loan) => {
  const totalClaim = calculateLoanRepayValue(loan)

  const DEFAULT_REPAY_PERCENT = 50
  const initialRepayPercent = loan.repaymentCall
    ? (loan.repaymentCall?.callAmount / totalClaim) * 100
    : DEFAULT_REPAY_PERCENT

  const initialRepayValue = loan.repaymentCall
    ? loan.repaymentCall?.callAmount
    : totalClaim * (initialRepayPercent / 100)

  return {
    totalClaim,
    initialRepayPercent,
    initialRepayValue,
  }
}
