import { Loan } from '@banx/api/core'
import { BONDS, WEEKS_IN_YEAR } from '@banx/constants'
import { calculateLoanRepayValue, isLoanListed } from '@banx/utils'

type CalcWeeklyInterestFee = (Loan: Loan) => number
export const calcWeeklyInterestFee: CalcWeeklyInterestFee = (loan) => {
  const aprInPercent = loan.bondTradeTransaction.amountOfBonds / 100
  const aprWithProtocolFee = aprInPercent + BONDS.PROTOCOL_REPAY_FEE / 100
  const repayValue = calculateLoanRepayValue(loan)

  const weeklyAprPercentage = aprWithProtocolFee / 100 / WEEKS_IN_YEAR

  const weeklyFee = weeklyAprPercentage * repayValue

  return weeklyFee
}

export const calculateLendValue = (loan: Loan) => {
  const borrowedValue = loan.bondTradeTransaction.solAmount + loan.bondTradeTransaction.feeAmount
  const debtValue = calculateLoanRepayValue(loan)

  return isLoanListed(loan) ? borrowedValue : debtValue
}
