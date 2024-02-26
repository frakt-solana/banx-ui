import { map } from 'lodash'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { calcWeightedAverage, calculateLoanRepayValue } from '@banx/utils'

export const calcAccruedInterest = (loan: Loan) => {
  const { accruedInterest = 0, bondTradeTransaction } = loan
  const { solAmount, feeAmount } = bondTradeTransaction || {}

  const repayValue = calculateLoanRepayValue(loan)
  const totalAccruedInterest = repayValue - solAmount - feeAmount + accruedInterest

  return totalAccruedInterest
}

export const calcUnpaidAccruedInterest = (loan: Loan) => {
  const totalRepaidAmount = loan.totalRepaidAmount || 0

  const accruedInterest = calcAccruedInterest(loan)
  const upfrontFee = calcUpfrontFee(loan)

  const totalAccruedInterest = accruedInterest + upfrontFee

  const unpaidAccruedInterest = Math.max(0, totalAccruedInterest - totalRepaidAmount)
  return unpaidAccruedInterest
}

export const caclFractionToRepay = (loan: Loan) => {
  const repayValue = calculateLoanRepayValue(loan)
  const percentToRepay = calcUnpaidAccruedInterest(loan) / repayValue

  return Math.floor(percentToRepay * 1e4)
}

export const calcUpfrontFee = (loan: Loan) => {
  const { bondTradeTransaction, fraktBond } = loan
  const upfrontFee = fraktBond.fbondTokenSupply || bondTradeTransaction.feeAmount

  return upfrontFee
}

export const calcWeightedApr = (loans: Loan[]) => {
  const totalAprValues = map(
    loans,
    (loan) => (loan.bondTradeTransaction.amountOfBonds + BONDS.PROTOCOL_REPAY_FEE) / 100,
  )

  const totalRepayValues = map(loans, calculateLoanRepayValue)
  return calcWeightedAverage(totalAprValues, totalRepayValues)
}
