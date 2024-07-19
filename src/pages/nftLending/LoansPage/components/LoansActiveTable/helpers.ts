import { BN } from 'fbonds-core'
import { calculatePartOfLoanBodyFromInterest } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { map } from 'lodash'

import { coreNew } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import {
  calcWeightedAverage,
  calculateLoanRepayValue,
  isBanxSolTokenType,
  isLoanRepaymentCallActive,
  isSolTokenType,
} from '@banx/utils'

//? This fee is associated with account creation. It's used to display the correct value when the SOL token type is used.
const getPartialRepayRentFee = (loan: coreNew.Loan): number => {
  const ACCOUNT_CREATION_FEE = 3229 * 1e3
  return isSolTokenType(loan.bondTradeTransaction.lendingToken) ||
    isBanxSolTokenType(loan.bondTradeTransaction.lendingToken)
    ? ACCOUNT_CREATION_FEE
    : 0
}

export const calcAccruedInterest = (loan: coreNew.Loan): BN => {
  //? For partial repayment loans, feeAmount is not included in the debt calculation.
  const repayValue = calculateLoanRepayValue(loan, false)

  const accruedInterest = repayValue.sub(loan.bondTradeTransaction.solAmount)
  return accruedInterest
}

const calculateUnpaidInterest = (loan: coreNew.Loan) => {
  const { lenderFullRepaidAmount } = loan.bondTradeTransaction

  const accruedInterest = calcAccruedInterest(loan)
  const rentFee = getPartialRepayRentFee(loan)

  const unpaidInterest = Math.max(0, accruedInterest.toNumber() - lenderFullRepaidAmount.toNumber())

  const percentToRepay = calcPercentToPay(loan, unpaidInterest)
  //? Check that the percentageToRepay is greater than 1, since the minimum loan payment is one percent.
  return percentToRepay >= 1 ? unpaidInterest + rentFee : 0
}

const calcPercentToPay = (loan: coreNew.Loan, iterestToPay: number) => {
  const { soldAt, amountOfBonds, solAmount } = loan.bondTradeTransaction
  const rateBasePoints = amountOfBonds.add(BONDS.PROTOCOL_REPAY_FEE_BN).toNumber()

  const partOfLoan = calculatePartOfLoanBodyFromInterest({
    soldAt: soldAt.toNumber(),
    rateBasePoints,
    iterestToPay,
  })
  return (partOfLoan / solAmount.toNumber()) * 100
}

export const caclFractionToRepay = (loan: coreNew.Loan) => {
  const iterestToPay = calculateUnpaidInterest(loan)
  const percentToRepay = calcPercentToPay(loan, iterestToPay)

  return Math.ceil(percentToRepay * 100)
}

export const caclFractionToRepayForRepaymentCall = (loan: coreNew.Loan) => {
  const debtWithoutFee = calculateLoanRepayValue(loan, false).toNumber()
  const repaymentCallAmount = loan.bondTradeTransaction.repaymentCallAmount.toNumber()

  const unroundedRepaymentPercentage = (repaymentCallAmount / debtWithoutFee) * 100
  return Math.ceil(unroundedRepaymentPercentage * 100)
}

export const calcTotalValueToPay = (loan: coreNew.Loan) => {
  if (isLoanRepaymentCallActive(loan)) {
    return loan.bondTradeTransaction.repaymentCallAmount
  }

  return new BN(calculateUnpaidInterest(loan))
}

export const calcWeightedApr = (loans: coreNew.Loan[]) => {
  const totalAprValues = map(
    loans,
    (loan) =>
      loan.bondTradeTransaction.amountOfBonds.add(BONDS.PROTOCOL_REPAY_FEE_BN).toNumber() / 100,
  )

  const totalRepayValues = map(loans, (loan) => calculateLoanRepayValue(loan).toNumber())
  return calcWeightedAverage(totalAprValues, totalRepayValues)
}
