import { web3 } from 'fbonds-core'
import {
  calculateCurrentInterestSolPure,
  calculatePartOfLoanBodyFromInterest,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { calcBorrowerTokenAPR } from 'fbonds-core/lib/fbond-protocol/helpers'
import { filter, first, groupBy, map, size, sumBy } from 'lodash'
import moment from 'moment'

import { TokenLoan } from '@banx/api/tokens'
import {
  caclulateBorrowTokenLoanValue,
  calcWeightedAverage,
  calculateTokenLoanLtvByLoanValue,
  isBanxSolTokenType,
  isTokenLoanRepaymentCallActive,
  isTokenLoanTerminating,
} from '@banx/utils'

import { PARTIAL_REPAY_ACCOUNT_CREATION_FEE } from './constants'
import { LoansPreview } from './types'

export const buildLoansPreviewGroupedByMint = (loans: TokenLoan[]): LoansPreview[] => {
  const groupedLoans = groupBy(loans, (loan) => loan.collateral.mint)

  return Object.entries(groupedLoans).map(([collateralMint, loans]) => {
    const weightedLtv = calculateWeightedLtv(loans)
    const weightedApr = calculateWeightedApr(loans)

    const { collateralPrice = 0, collateral } = first(loans) || {}

    const collareralTicker = collateral?.ticker || ''
    const collateralLogoUrl = collateral?.logoUrl || ''

    const totalDebt = sumBy(loans, (loan) => caclulateBorrowTokenLoanValue(loan).toNumber())

    const terminatingLoansAmount = size(filter(loans, isTokenLoanTerminating))
    const repaymentCallsAmount = size(filter(loans, isTokenLoanRepaymentCallActive))

    return {
      collateralMint,
      collareralTicker,
      collateralLogoUrl,

      collateralPrice,
      totalDebt,
      weightedLtv,
      weightedApr,
      terminatingLoansAmount,
      repaymentCallsAmount,
      loans,
    }
  })
}

export const calculateWeightedLtv = (loans: TokenLoan[]) => {
  const totalLtvValues = loans.map((loan) => {
    const loanValue = caclulateBorrowTokenLoanValue(loan).toNumber()
    return calculateTokenLoanLtvByLoanValue(loan, loanValue)
  })

  const totalRepayValues = loans.map((loan) => caclulateBorrowTokenLoanValue(loan).toNumber())

  return calcWeightedAverage(totalLtvValues, totalRepayValues)
}

export const calculateWeightedApr = (loans: TokenLoan[]) => {
  const totalAprValues = map(loans, (loan) => {
    const marketPubkey = new web3.PublicKey(loan.fraktBond.hadoMarket)
    return calcBorrowerTokenAPR(loan.bondTradeTransaction.amountOfBonds, marketPubkey) / 100
  })

  const totalRepayValues = map(loans, (loan) => caclulateBorrowTokenLoanValue(loan).toNumber())

  return calcWeightedAverage(totalAprValues, totalRepayValues)
}

//? This fee is associated with account creation. It's used to display the correct value when the SOL token type is used.
const getPartialRepayRentFee = (loan: TokenLoan) => {
  return isBanxSolTokenType(loan.bondTradeTransaction.lendingToken)
    ? PARTIAL_REPAY_ACCOUNT_CREATION_FEE
    : 0
}

export const calculateAccruedInterest = (loan: TokenLoan) => {
  const { amountOfBonds, solAmount, soldAt } = loan.bondTradeTransaction

  const borrowerApr = calcBorrowerTokenAPR(
    amountOfBonds,
    new web3.PublicKey(loan.fraktBond.hadoMarket),
  )

  return calculateCurrentInterestSolPure({
    loanValue: solAmount,
    startTime: soldAt,
    currentTime: moment().unix(),
    rateBasePoints: borrowerApr,
  })
}

const calculateUnpaidInterest = (loan: TokenLoan) => {
  const { lenderFullRepaidAmount } = loan.bondTradeTransaction

  const accruedInterest = calculateAccruedInterest(loan)
  const rentFee = getPartialRepayRentFee(loan)

  const unpaidInterest = Math.max(0, accruedInterest - lenderFullRepaidAmount)

  const percentToRepay = calcPercentToPay(loan, unpaidInterest)
  //? Check that the percentageToRepay is greater than 1, since the minimum loan payment is one percent.
  return percentToRepay >= 1 ? unpaidInterest + rentFee : 0
}

const calcPercentToPay = (loan: TokenLoan, iterestToPay: number) => {
  const { soldAt, amountOfBonds, solAmount } = loan.bondTradeTransaction

  const borrowerApr = calcBorrowerTokenAPR(
    amountOfBonds,
    new web3.PublicKey(loan.fraktBond.hadoMarket),
  )

  const partOfLoan = calculatePartOfLoanBodyFromInterest({
    soldAt,
    iterestToPay,
    rateBasePoints: borrowerApr,
  })

  return (partOfLoan / solAmount) * 100
}

export const caclFractionToRepay = (loan: TokenLoan) => {
  const iterestToPay = calculateUnpaidInterest(loan)
  const percentToRepay = calcPercentToPay(loan, iterestToPay)

  return Math.ceil(percentToRepay * 100)
}

export const caclFractionToRepayForRepaymentCall = (loan: TokenLoan) => {
  const debtWithoutFee = caclulateBorrowTokenLoanValue(loan, false).toNumber()
  const repaymentCallAmount = loan.bondTradeTransaction.repaymentCallAmount

  const unroundedRepaymentPercentage = (repaymentCallAmount / debtWithoutFee) * 100
  return Math.ceil(unroundedRepaymentPercentage * 100)
}

export const calcTokenTotalValueToPay = (loan: TokenLoan) => {
  if (isTokenLoanRepaymentCallActive(loan)) {
    return loan.bondTradeTransaction.repaymentCallAmount
  }

  return calculateUnpaidInterest(loan)
}
