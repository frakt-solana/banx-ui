import { calculatePartOfLoanBodyFromInterest } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { map } from 'lodash'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import { calcWeightedAverage, calculateLoanRepayValue, isSolTokenType } from '@banx/utils'

//? Fee for creating an account
export const ACCOUNT_CREATION_FEE = 3229 * 1e3

export const calcAccruedInterest = (loan: Loan) => {
  const { bondTradeTransaction } = loan

  const repayValue = calculateLoanRepayValue(loan, false)
  const totalAccruedInterest = repayValue - bondTradeTransaction.solAmount

  return totalAccruedInterest
}

export const calculateUnpaidInterest = (loan: Loan) => {
  const { bondTradeTransaction } = loan
  const { borrowerFullRepaidAmount, lendingToken } = bondTradeTransaction
  const accruedInterest = calcAccruedInterest(loan)

  const additionalFee = isSolTokenType(lendingToken) ? ACCOUNT_CREATION_FEE : 0
  const unpaidInterest = Math.max(0, accruedInterest - borrowerFullRepaidAmount)
  return unpaidInterest + additionalFee
}

export const caclFractionToRepay = (loan: Loan) => {
  const { bondTradeTransaction } = loan
  const { solAmount, soldAt, amountOfBonds, lendingToken } = bondTradeTransaction

  const additionalFee = isSolTokenType(lendingToken) ? ACCOUNT_CREATION_FEE : 0

  const interestBasedLoanPart = calculatePartOfLoanBodyFromInterest({
    soldAt,
    rateBasePoints: amountOfBonds + BONDS.PROTOCOL_REPAY_FEE,
    iterestToPay: calculateUnpaidInterest(loan) - additionalFee,
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
