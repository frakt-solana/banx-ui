import {
  calculateCurrentInterestSolPure,
  calculatePartOfLoanBodyFromInterest,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { map } from 'lodash'
import moment from 'moment'

import { core } from '@banx/api/nft'
import { BONDS } from '@banx/constants'
import {
  calcWeightedAverage,
  calculateLoanRepayValue,
  isBanxSolTokenType,
  isLoanRepaymentCallActive,
  isSolTokenType,
} from '@banx/utils'

//? This fee is associated with account creation. It's used to display the correct value when the SOL token type is used.
const getPartialRepayRentFee = (loan: core.Loan) => {
  const ACCOUNT_CREATION_FEE = 3229 * 1e3
  return isSolTokenType(loan.bondTradeTransaction.lendingToken) ||
    isBanxSolTokenType(loan.bondTradeTransaction.lendingToken)
    ? ACCOUNT_CREATION_FEE
    : 0
}

export const calcAccruedInterest = (loan: core.Loan) => {
  const { amountOfBonds, solAmount, soldAt } = loan.bondTradeTransaction

  const interestParameters = {
    loanValue: solAmount,
    startTime: soldAt,
    currentTime: moment().unix(),
    rateBasePoints: amountOfBonds + BONDS.PROTOCOL_REPAY_FEE,
  }

  return calculateCurrentInterestSolPure(interestParameters)
}

const calculateUnpaidInterest = (loan: core.Loan) => {
  const { lenderFullRepaidAmount } = loan.bondTradeTransaction

  const accruedInterest = calcAccruedInterest(loan)
  const rentFee = getPartialRepayRentFee(loan)

  const unpaidInterest = Math.max(0, accruedInterest - lenderFullRepaidAmount)

  const percentToRepay = calcPercentToPay(loan, unpaidInterest)
  //? Check that the percentageToRepay is greater than 1, since the minimum loan payment is one percent.
  return percentToRepay >= 1 ? unpaidInterest + rentFee : 0
}

const calcPercentToPay = (loan: core.Loan, iterestToPay: number) => {
  const { soldAt, amountOfBonds, solAmount } = loan.bondTradeTransaction
  const rateBasePoints = amountOfBonds + BONDS.PROTOCOL_REPAY_FEE

  const partOfLoan = calculatePartOfLoanBodyFromInterest({ soldAt, rateBasePoints, iterestToPay })
  return (partOfLoan / solAmount) * 100
}

export const caclFractionToRepay = (loan: core.Loan) => {
  const iterestToPay = calculateUnpaidInterest(loan)
  const percentToRepay = calcPercentToPay(loan, iterestToPay)

  return Math.ceil(percentToRepay * 100)
}

export const caclFractionToRepayForRepaymentCall = (loan: core.Loan) => {
  const debtWithoutFee = calculateLoanRepayValue(loan, false)
  const repaymentCallAmount = loan.bondTradeTransaction.repaymentCallAmount

  const unroundedRepaymentPercentage = (repaymentCallAmount / debtWithoutFee) * 100
  return Math.ceil(unroundedRepaymentPercentage * 100)
}

export const calcTotalValueToPay = (loan: core.Loan) => {
  if (isLoanRepaymentCallActive(loan)) {
    return loan.bondTradeTransaction.repaymentCallAmount
  }

  return calculateUnpaidInterest(loan)
}

export const calcWeightedApr = (loans: core.Loan[]) => {
  const totalAprValues = map(
    loans,
    (loan) => (loan.bondTradeTransaction.amountOfBonds + BONDS.PROTOCOL_REPAY_FEE) / 100,
  )

  const totalRepayValues = map(loans, (loan) => calculateLoanRepayValue(loan))
  return calcWeightedAverage(totalAprValues, totalRepayValues)
}
