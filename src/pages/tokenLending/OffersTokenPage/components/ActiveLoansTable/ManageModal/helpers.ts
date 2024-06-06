import moment from 'moment'

import { core } from '@banx/api/tokens'
import { calculateLentTokenValueWithInterest } from '@banx/utils'

export const calculateFreezeExpiredAt = (loan: core.TokenLoan) => {
  return loan.bondTradeTransaction.soldAt + loan.bondTradeTransaction.terminationFreeze
}

export const checkIfFreezeExpired = (loan: core.TokenLoan) => {
  const freezeExpiredAt = calculateFreezeExpiredAt(loan)
  const currentTimeInSeconds = moment().unix()
  return currentTimeInSeconds > freezeExpiredAt
}

export const calculateRepaymentStaticValues = (loan: core.TokenLoan) => {
  const DEFAULT_REPAY_PERCENT = 50

  const repaymentCallActive = false

  const repaymentCallLenderReceives = 0

  const totalClaim = calculateLentTokenValueWithInterest(loan).toNumber()

  const initialRepayPercent = repaymentCallActive
    ? (repaymentCallLenderReceives / totalClaim) * 100
    : DEFAULT_REPAY_PERCENT

  const initialRepayValue = repaymentCallActive
    ? repaymentCallLenderReceives
    : totalClaim * (initialRepayPercent / 100)

  return {
    repaymentCallActive,
    totalClaim,
    initialRepayPercent,
    initialRepayValue,
  }
}
