import { BN } from 'fbonds-core'
import {
  calculateCurrentInterestSolPure,
  calculateLenderPartialPartFromBorrower,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'

import { core } from '@banx/api/tokens'
import { SECONDS_IN_72_HOURS, SECONDS_IN_DAY } from '@banx/constants'

import { calculateApr } from '../loans'

export const isTokenLoanFrozen = (loan: core.TokenLoan) => {
  return !!loan.bondTradeTransaction.terminationFreeze
}

export const isTokenLoanListed = (loan: core.TokenLoan) => {
  return (
    loan.bondTradeTransaction.bondTradeTransactionState ===
    BondTradeTransactionV2State.PerpetualBorrowerListing
  )
}

export const isTokenLoanRepaid = (loan: core.TokenLoan) => {
  return (
    loan.bondTradeTransaction.bondTradeTransactionState ===
    BondTradeTransactionV2State.PerpetualRepaid
  )
}

export const isTokenLoanTerminating = (loan: core.TokenLoan) => {
  return (
    loan.bondTradeTransaction.bondTradeTransactionState ===
    BondTradeTransactionV2State.PerpetualManualTerminating
  )
}

export const isTokenLoanLiquidated = (loan: core.TokenLoan) => {
  if (!loan.fraktBond.refinanceAuctionStartedAt) return false

  const currentTimeInSeconds = moment().unix()
  const expiredAt = loan.fraktBond.refinanceAuctionStartedAt + SECONDS_IN_72_HOURS
  return currentTimeInSeconds > expiredAt
}

export const isTokenLoanActive = (loan: core.TokenLoan) => {
  const { bondTradeTransactionState } = loan.bondTradeTransaction

  return (
    bondTradeTransactionState === BondTradeTransactionV2State.PerpetualActive ||
    bondTradeTransactionState === BondTradeTransactionV2State.PerpetualRefinancedActive
  )
}

export const getTokenLoanSupply = (loan: core.TokenLoan) => {
  const collateralSupply = loan.fraktBond.fbondTokenSupply / Math.pow(10, loan.collateral.decimals)
  return collateralSupply
}

export const calculateTokenLoanLtvByLoanValue = (loan: core.TokenLoan, value: number) => {
  const collateralSupply = getTokenLoanSupply(loan)

  const ltvRatio = value / collateralSupply
  const ltvPercent = (ltvRatio / loan.collateralPrice) * 100

  return ltvPercent
}

export const isTokenLoanUnderWater = (loan: core.TokenLoan) => {
  const LTV_THRESHOLD = 100

  const loanValue = calculateTokenLoanValueWithUpfrontFee(loan).toNumber()
  const ltvPercent = calculateTokenLoanLtvByLoanValue(loan, loanValue)

  return ltvPercent > LTV_THRESHOLD
}

export const isTokenLoanRepaymentCallActive = (loan: core.TokenLoan) => {
  if (!loan.bondTradeTransaction.repaymentCallAmount || isTokenLoanTerminating(loan)) return false

  const repayValue = caclulateBorrowTokenLoanValue(loan).toNumber()
  return !!(loan.bondTradeTransaction.repaymentCallAmount / repayValue)
}

/**
  As we need to show how much lender receives. We need to calculate this value from repaymentCallAmount (how much borrower should pay)
 */
export const calculateTokenRepaymentCallLenderReceivesAmount = (loan: core.TokenLoan) => {
  const { repaymentCallAmount, soldAt, amountOfBonds } = loan.bondTradeTransaction

  return calculateLenderPartialPartFromBorrower({
    borrowerPart: repaymentCallAmount,
    protocolRepayFeeApr: 0,
    soldAt,
    //? Lender APR (without ProtocolFee)
    lenderApr: calculateApr({
      loanValue: amountOfBonds,
      collectionFloor: loan.collateralPrice,
      marketPubkey: loan.fraktBond.hadoMarket,
    }),
  })
}

export const caclulateBorrowTokenLoanValue = (loan: core.TokenLoan, upfrontFeeIncluded = true) => {
  const repayValueBN = calculateTokenLoanRepayValueOnCertainDate({
    loan,
    upfrontFeeIncluded,
    date: moment().unix(),
  })

  return repayValueBN
}

type CalculateTokenLoanRepayValueOnCertainDate = (params: {
  loan: core.TokenLoan
  upfrontFeeIncluded?: boolean
  date: number //? Unix timestamp
}) => BN
/**
 * set upfrontFeeIncluded false for partial repay
 */

export const calculateTokenLoanRepayValueOnCertainDate: CalculateTokenLoanRepayValueOnCertainDate =
  ({ loan, upfrontFeeIncluded = true, date }): BN => {
    const { solAmount, soldAt, amountOfBonds } = loan.bondTradeTransaction || {}

    const loanValue = upfrontFeeIncluded
      ? calculateTokenLoanValueWithUpfrontFee(loan).toNumber()
      : solAmount

    const calculatedInterest = calculateCurrentInterestSolPure({
      loanValue,
      startTime: soldAt,
      currentTime: date,
      rateBasePoints: amountOfBonds,
    })

    return new BN(loanValue).add(new BN(calculatedInterest))
  }

export const calculateTokenLoanValueWithUpfrontFee = (loan: core.TokenLoan) => {
  const { solAmount, feeAmount } = loan.bondTradeTransaction
  return new BN(solAmount).add(new BN(feeAmount))
}

export const calculateLentTokenValueWithInterest = (loan: core.TokenLoan) => {
  const loanValueWithUpfrontFee = calculateTokenLoanValueWithUpfrontFee(loan)
  const accruedInterest = calculateTokenLoanAccruedInterest(loan)

  return loanValueWithUpfrontFee.add(accruedInterest)
}

export const calculateTokenLoanAccruedInterest = (loan: core.TokenLoan) => {
  const { amountOfBonds, soldAt } = loan.bondTradeTransaction

  const loanValueWithUpfrontFee = calculateTokenLoanValueWithUpfrontFee(loan)

  const accruedInterest = calculateCurrentInterestSolPure({
    loanValue: loanValueWithUpfrontFee.toNumber(),
    startTime: soldAt,
    currentTime: moment().unix(),
    rateBasePoints: amountOfBonds,
  })

  return new BN(accruedInterest)
}

export const calcTokenWeeklyFeeWithRepayFee = (loan: core.TokenLoan) => {
  const { soldAt, amountOfBonds } = loan.bondTradeTransaction

  return calculateCurrentInterestSolPure({
    loanValue: calculateTokenLoanValueWithUpfrontFee(loan).toNumber(),
    startTime: soldAt,
    currentTime: soldAt + SECONDS_IN_DAY * 7,
    rateBasePoints: amountOfBonds,
  })
}
