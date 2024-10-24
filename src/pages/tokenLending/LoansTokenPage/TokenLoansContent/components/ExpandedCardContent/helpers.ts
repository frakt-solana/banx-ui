import { sumBy } from 'lodash'

import { TokenLoan } from '@banx/api/tokens'
import {
  LoanStatus,
  STATUS_LOANS_MAP,
  caclulateBorrowTokenLoanValue,
  calcTokenWeeklyFeeWithRepayFee,
  isTokenLoanRepaymentCallActive,
  isTokenLoanSelling,
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

export const getTokenLoanStatus = (loan: TokenLoan) => {
  //? Show 'Active' since the loan sale doesn't affect the borrower
  if (isTokenLoanSelling(loan)) return LoanStatus.Active

  return STATUS_LOANS_MAP[loan.bondTradeTransaction.bondTradeTransactionState]
}
