import { sumBy } from 'lodash'

import { TokenLoan } from '@banx/api/tokens'
import {
  caclulateBorrowTokenLoanValue,
  calcTokenWeeklyFeeWithRepayFee,
  isTokenLoanRepaymentCallActive,
} from '@banx/utils'

import { calcTokenTotalValueToPay, calculateWeightedApr } from '../../helpers'

export const getPayInterestActionText = (loans: TokenLoan[]) => {
  if (loans.length === 0) return 'Pay'

  const hasActiveRepaymentCall = loans.some(isTokenLoanRepaymentCallActive)
  const noActiveRepaymentCalls = loans.every((loan) => !isTokenLoanRepaymentCallActive(loan))

  if (hasActiveRepaymentCall && !noActiveRepaymentCalls) return 'Repayment call'
  if (noActiveRepaymentCalls) return 'Pay interest'

  return 'Pay'
}

export const calculateLoansStats = (loans: TokenLoan[]) => {
  const totalSelectedLoans = loans.length

  const totalDebt = sumBy(loans, (loan) => caclulateBorrowTokenLoanValue(loan).toNumber())
  const totalWeeklyFee = sumBy(loans, calcTokenWeeklyFeeWithRepayFee)
  const totalValueToPay = sumBy(loans, calcTokenTotalValueToPay)
  const weightedApr = calculateWeightedApr(loans)

  return { totalSelectedLoans, totalDebt, totalWeeklyFee, totalValueToPay, weightedApr }
}
