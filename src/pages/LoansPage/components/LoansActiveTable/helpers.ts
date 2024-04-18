import { calculatePartOfLoanBodyFromInterest } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { map } from 'lodash'

import { Loan } from '@banx/api/core'
import { BONDS } from '@banx/constants'
import {
  calcWeightedAverage,
  calculateLoanRepayValue,
  isLoanRepaymentCallActive,
  isSolTokenType,
} from '@banx/utils'

//? This fee is associated with account creation. It's used to display the correct value when the SOL token type is used.
const getAdditionalFee = (loan: Loan) => {
  const ACCOUNT_CREATION_FEE = 3229 * 1e3
  return isSolTokenType(loan.bondTradeTransaction.lendingToken) ? ACCOUNT_CREATION_FEE : 0
}

export const calcAccruedInterest = (loan: Loan) => {
  //? For partial repayment loans, feeAmount is not included in the debt calculation.
  const repayValue = calculateLoanRepayValue(loan, false)

  const accruedInterest = repayValue - loan.bondTradeTransaction.solAmount
  return accruedInterest
}

const calculateUnpaidInterest = (loan: Loan) => {
  const { lenderFullRepaidAmount } = loan.bondTradeTransaction

  const accruedInterest = calcAccruedInterest(loan)
  const additionalFee = getAdditionalFee(loan)

  const unpaidInterest = Math.max(0, accruedInterest - lenderFullRepaidAmount)
  return unpaidInterest + additionalFee
}

const calcPercentToPay = (loan: Loan, iterestToPay: number) => {
  const { soldAt, amountOfBonds, solAmount } = loan.bondTradeTransaction
  const rateBasePoints = amountOfBonds + BONDS.PROTOCOL_REPAY_FEE

  const partOfLoan = calculatePartOfLoanBodyFromInterest({ soldAt, rateBasePoints, iterestToPay })
  return (partOfLoan / solAmount) * 100
}

export const caclFractionToRepay = (loan: Loan) => {
  const iterestToPay = calculateUnpaidInterest(loan)
  const percentToRepay = calcPercentToPay(loan, iterestToPay)

  return Math.ceil(percentToRepay * 100)
}

export const caclFractionToRepayForRepaymentCall = (loan: Loan) => {
  const debtWithoutFee = calculateLoanRepayValue(loan, false)
  const repaymentCallAmount = loan.bondTradeTransaction.repaymentCallAmount

  const repaymentPercentage = (repaymentCallAmount / debtWithoutFee) * 100
  return Math.ceil(repaymentPercentage * 100)
}

export const calcTotalValueToPay = (loan: Loan) => {
  if (isLoanRepaymentCallActive(loan)) {
    return loan.bondTradeTransaction.repaymentCallAmount
  }

  return calculateUnpaidInterest(loan)
}

export const calcWeightedApr = (loans: Loan[]) => {
  const totalAprValues = map(
    loans,
    (loan) => (loan.bondTradeTransaction.amountOfBonds + BONDS.PROTOCOL_REPAY_FEE) / 100,
  )

  const totalRepayValues = map(loans, (loan) => calculateLoanRepayValue(loan))
  return calcWeightedAverage(totalAprValues, totalRepayValues)
}
