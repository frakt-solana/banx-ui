import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue, isLoanRepaymentCallActive } from '@banx/utils'

export const calculateRepaymentStaticValues = (loan: Loan) => {
  const repaymentCallActive = isLoanRepaymentCallActive(loan)
  const repaymentCallAmount = loan.repaymentCall?.callAmount || 0

  const totalClaim = calculateLoanRepayValue(loan)

  const { solAmount, feeAmount, soldAt, amountOfBonds } = loan.bondTradeTransaction
  const accuredInterest = calculateCurrentInterestSolPure({
    loanValue: solAmount + feeAmount,
    startTime: soldAt,
    currentTime: moment().unix(),
    rateBasePoints: amountOfBonds,
  })

  const DEFAULT_REPAY_PERCENT = 50
  const initialRepayPercent = repaymentCallActive
    ? (repaymentCallAmount / totalClaim) * 100
    : DEFAULT_REPAY_PERCENT

  const initialRepayValue = repaymentCallActive
    ? repaymentCallAmount
    : totalClaim * (initialRepayPercent / 100)

  return {
    repaymentCallActive,
    accuredInterest,
    totalClaim,
    initialRepayPercent,
    initialRepayValue,
  }
}
