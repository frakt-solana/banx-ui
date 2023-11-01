import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import { isInteger } from 'lodash'
import moment from 'moment'

import { Loan } from '@banx/api/core'
import { BONDS, SECONDS_IN_72_HOURS } from '@banx/constants'

export enum LoanStatus {
  Active = 'active',
  Refinanced = 'refinanced',
  Repaid = 'repaid',
  PartialRepaid = 'partial repaid',
  Liquidated = 'liquidated',
  Terminating = 'terminating',
}

export const STATUS_LOANS_MAP: Record<string, string> = {
  [BondTradeTransactionV2State.PerpetualActive]: LoanStatus.Active,
  [BondTradeTransactionV2State.PerpetualRefinancedActive]: LoanStatus.Active,
  [BondTradeTransactionV2State.PerpetualRepaid]: LoanStatus.Repaid,
  [BondTradeTransactionV2State.PerpetualRefinanceRepaid]: LoanStatus.Refinanced,
  [BondTradeTransactionV2State.PerpetualPartialRepaid]: LoanStatus.PartialRepaid,
  [BondTradeTransactionV2State.PerpetualLiquidatedByClaim]: LoanStatus.Liquidated,
  [BondTradeTransactionV2State.PerpetualManualTerminating]: LoanStatus.Terminating,
}

export const STATUS_LOANS_COLOR_MAP: Record<LoanStatus, string> = {
  [LoanStatus.Active]: 'var(--additional-green-primary-deep)',
  [LoanStatus.Refinanced]: 'var(--additional-green-primary-deep)',
  [LoanStatus.Repaid]: 'var(--additional-green-primary-deep)',
  // [LoanStatus.RefinanceRepaid]: 'var(--additional-green-primary-deep)',
  [LoanStatus.PartialRepaid]: 'var(--additional-green-primary-deep)',
  [LoanStatus.Terminating]: 'var(--additional-lava-primary-deep)',
  [LoanStatus.Liquidated]: 'var(--additional-red-primary-deep)',
}

export const isLoanLiquidated = (loan: Loan) => {
  const { fraktBond } = loan

  if (!fraktBond.refinanceAuctionStartedAt) return false

  const currentTimeInSeconds = moment().unix()

  const expiredAt = fraktBond.refinanceAuctionStartedAt + SECONDS_IN_72_HOURS

  return currentTimeInSeconds > expiredAt
}

export const determineLoanStatus = (loan: Loan) => {
  const { bondTradeTransactionState } = loan.bondTradeTransaction

  const mappedStatus = STATUS_LOANS_MAP[bondTradeTransactionState]

  if (mappedStatus !== LoanStatus.Active && isLoanLiquidated(loan)) {
    return LoanStatus.Liquidated
  }

  return mappedStatus
}

export const calculateLoanRepayValue = (loan: Loan) => {
  const { solAmount, feeAmount, soldAt, amountOfBonds } = loan.bondTradeTransaction || {}

  const loanValueWithFee = solAmount + feeAmount

  const calculatedInterest = calculateCurrentInterestSolPure({
    loanValue: loanValueWithFee,
    startTime: soldAt,
    currentTime: moment().unix(),
    rateBasePoints: amountOfBonds + BONDS.PROTOCOL_REPAY_FEE,
  })

  return loanValueWithFee + calculatedInterest
}

export const formatLoansAmount = (loansAmount = 0) => {
  if (loansAmount < 1) {
    return '1'
  }

  if (isInteger(loansAmount)) {
    return String(loansAmount)
  }

  return loansAmount.toFixed(2)
}

export const calcLoanBorrowedAmount = (loan: Loan) => {
  const { solAmount, feeAmount } = loan.bondTradeTransaction
  return solAmount + feeAmount
}

export const isLoanActive = (loan: Loan) => {
  const status = determineLoanStatus(loan)
  return status === LoanStatus.Active
}

export const isLoanActiveOrRefinanced = (loan: Loan) => {
  //? Add RefinancedActive in future
  return isLoanActive(loan)
  // const status = determineLoanStatus(loan)
  // return status === LoanStatus.Active || status === LoanStatus.Refinanced
}

export const isLoanRepaid = (loan: Loan) => {
  const status = determineLoanStatus(loan)
  return status === LoanStatus.Repaid
}

export const isLoanTerminating = (loan: Loan) => {
  const { bondTradeTransactionState } = loan.bondTradeTransaction || {}

  const mappedStatus = STATUS_LOANS_MAP[bondTradeTransactionState] || ''
  return mappedStatus === LoanStatus.Terminating
}

export const isUnderWaterLoan = (loan: Loan) => {
  const {
    fraktBond,
    nft: { collectionFloor },
  } = loan
  const lentValue = fraktBond.currentPerpetualBorrowed

  return lentValue > collectionFloor
}
