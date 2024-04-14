import { calculatePartOfLoanBodyFromInterest } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { map } from 'lodash'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { calcWeightedAverage, calculateLoanRepayValue } from '@banx/utils'

//? Fee for creating an account
export const ACCOUNT_CREATION_FEE = 3229 * 1e3

export const calcAccruedInterest = (loan: Loan) => {
  const { bondTradeTransaction } = loan

  const repayValue = calculateLoanRepayValue(loan, false)
  const totalAccruedInterest = repayValue - bondTradeTransaction.solAmount

  return totalAccruedInterest
}

export const calculateUnpaidInterest = (loan: Loan) => {
  const totalRepaidAmount = loan.bondTradeTransaction.borrowerFullRepaidAmount
  const accruedInterest = calcAccruedInterest(loan)

  const unpaidInterest = Math.max(0, accruedInterest - totalRepaidAmount)
  return unpaidInterest + ACCOUNT_CREATION_FEE
}

export const caclFractionToRepay = (loan: Loan) => {
  const { bondTradeTransaction } = loan
  const { solAmount, soldAt, amountOfBonds } = bondTradeTransaction

  const interestBasedLoanPart = calculatePartOfLoanBodyFromInterest({
    soldAt,
    rateBasePoints: amountOfBonds + BONDS.PROTOCOL_REPAY_FEE,
    iterestToPay: calculateUnpaidInterest(loan) - ACCOUNT_CREATION_FEE,
  })

  const percentToRepay = (interestBasedLoanPart / solAmount) * 100
  return Math.floor(percentToRepay * 100)
}

export const calcWeightedApr = (loans: Loan[]) => {
  const totalAprValues = map(
    loans,
    (loan) => (loan.bondTradeTransaction.amountOfBonds + BONDS.PROTOCOL_REPAY_FEE) / 100,
  )

  const totalRepayValues = map(loans, (loan) => calculateLoanRepayValue(loan))
  return calcWeightedAverage(totalAprValues, totalRepayValues)
}
