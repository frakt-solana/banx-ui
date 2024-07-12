import { calculatePartOfLoanBodyFromInterest } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { map } from 'lodash'

import { core } from '@banx/api/tokens'
import { BONDS } from '@banx/constants'
import {
  caclulateBorrowTokenLoanValue,
  calcWeightedAverage,
  isBanxSolTokenType,
  isTokenLoanRepaymentCallActive,
} from '@banx/utils'

//? This fee is associated with account creation. It's used to display the correct value when the SOL token type is used.
const getPartialRepayRentFee = (loan: core.TokenLoan) => {
  const ACCOUNT_CREATION_FEE = 3229 * 1e3
  return isBanxSolTokenType(loan.bondTradeTransaction.lendingToken) ? ACCOUNT_CREATION_FEE : 0
}

export const calcAccruedInterest = (loan: core.TokenLoan) => {
  //? For partial repayment loans, feeAmount is not included in the debt calculation.
  const repayValue = caclulateBorrowTokenLoanValue(loan, false).toNumber()

  const accruedInterest = repayValue - loan.bondTradeTransaction.solAmount
  return accruedInterest
}

const calculateUnpaidInterest = (loan: core.TokenLoan) => {
  const { lenderFullRepaidAmount } = loan.bondTradeTransaction

  const accruedInterest = calcAccruedInterest(loan)
  const rentFee = getPartialRepayRentFee(loan)

  const unpaidInterest = Math.max(0, accruedInterest - lenderFullRepaidAmount)

  const percentToRepay = calcPercentToPay(loan, unpaidInterest)
  //? Check that the percentageToRepay is greater than 1, since the minimum loan payment is one percent.
  return percentToRepay >= 1 ? unpaidInterest + rentFee : 0
}

const calcPercentToPay = (loan: core.TokenLoan, iterestToPay: number) => {
  const { soldAt, amountOfBonds, solAmount } = loan.bondTradeTransaction
  const rateBasePoints = amountOfBonds + BONDS.PROTOCOL_REPAY_FEE

  const partOfLoan = calculatePartOfLoanBodyFromInterest({ soldAt, rateBasePoints, iterestToPay })
  return (partOfLoan / solAmount) * 100
}

export const caclFractionToRepay = (loan: core.TokenLoan) => {
  const iterestToPay = calculateUnpaidInterest(loan)
  const percentToRepay = calcPercentToPay(loan, iterestToPay)

  return Math.ceil(percentToRepay * 100)
}

export const caclFractionToRepayForRepaymentCall = (loan: core.TokenLoan) => {
  const debtWithoutFee = caclulateBorrowTokenLoanValue(loan, false).toNumber()
  const repaymentCallAmount = loan.bondTradeTransaction.repaymentCallAmount

  const unroundedRepaymentPercentage = (repaymentCallAmount / debtWithoutFee) * 100
  return Math.ceil(unroundedRepaymentPercentage * 100)
}

export const calcTokenTotalValueToPay = (loan: core.TokenLoan) => {
  if (isTokenLoanRepaymentCallActive(loan)) {
    return loan.bondTradeTransaction.repaymentCallAmount
  }

  return calculateUnpaidInterest(loan)
}

export const calcWeightedApr = (loans: core.TokenLoan[]) => {
  const totalAprValues = map(
    loans,
    (loan) => (loan.bondTradeTransaction.amountOfBonds + BONDS.PROTOCOL_REPAY_FEE) / 100,
  )

  const totalRepayValues = map(loans, (loan) => caclulateBorrowTokenLoanValue(loan).toNumber())
  return calcWeightedAverage(totalAprValues, totalRepayValues)
}