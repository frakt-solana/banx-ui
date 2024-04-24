import { BASE_POINTS, SECONDS_IN_DAY } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  calculateCurrentInterestSolPure,
  calculateDynamicApr,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import { isInteger } from 'lodash'
import moment from 'moment'

import { Loan } from '@banx/api/core'
import { BONDS, DYNAMIC_APR, MARKETS_WITH_CUSTOM_APR, SECONDS_IN_72_HOURS } from '@banx/constants'

export enum LoanStatus {
  Active = 'active',
  Refinanced = 'refinanced',
  RefinancedActive = 'refinanced active',
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

export const STATUS_LOANS_MAP_WITH_REFINANCED_ACTIVE: Record<string, string> = {
  ...STATUS_LOANS_MAP,
  [BondTradeTransactionV2State.PerpetualRefinancedActive]: LoanStatus.RefinancedActive,
}

export const STATUS_LOANS_COLOR_MAP: Record<LoanStatus, string> = {
  [LoanStatus.Active]: 'var(--additional-green-primary-deep)',
  [LoanStatus.Refinanced]: 'var(--additional-green-primary-deep)',
  [LoanStatus.RefinancedActive]: 'var(--additional-green-primary-deep)',
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

export const calculateLoanRepayValue = (loan: Loan, includeFee = true) => {
  const { solAmount, feeAmount, soldAt, amountOfBonds } = loan.bondTradeTransaction || {}

  const loanValue = includeFee ? solAmount + feeAmount : solAmount

  const calculatedInterest = calculateCurrentInterestSolPure({
    loanValue,
    startTime: soldAt,
    currentTime: moment().unix(),
    rateBasePoints: amountOfBonds + BONDS.PROTOCOL_REPAY_FEE,
  })

  return loanValue + calculatedInterest
}

export const formatLoansAmount = (loansAmount = 0) => {
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
  const { solAmount, feeAmount } = loan.bondTradeTransaction || {}

  const collectionFloor = loan.nft.collectionFloor
  const totalLentValue = solAmount + feeAmount

  return totalLentValue > collectionFloor
}

//? Returns apr value in base points: 7380 => 73.8%
type CalculateApr = (params: {
  loanValue: number
  collectionFloor: number
  marketPubkey?: string
}) => number
export const calculateApr: CalculateApr = ({ loanValue, collectionFloor, marketPubkey }) => {
  //? exceptions for some collections with hardcoded APR
  const customApr = MARKETS_WITH_CUSTOM_APR[marketPubkey || '']
  if (customApr !== undefined) {
    return customApr
  }

  const staticApr = Math.floor((loanValue / collectionFloor) * BASE_POINTS) || 0
  return calculateDynamicApr(staticApr, DYNAMIC_APR)
}

export const calcWeeklyFeeWithRepayFee = (loan: Loan) => {
  const { soldAt, amountOfBonds } = loan.bondTradeTransaction

  return calculateCurrentInterestSolPure({
    loanValue: calcLoanBorrowedAmount(loan),
    startTime: soldAt,
    currentTime: soldAt + SECONDS_IN_DAY * 7,
    rateBasePoints: amountOfBonds + BONDS.PROTOCOL_REPAY_FEE,
  })
}

export const isLoanRepaymentCallActive = (loan: Loan) => {
  if (!loan.bondTradeTransaction.repaymentCallAmount || isLoanTerminating(loan)) return false

  const repayValueWithoutProtocolFee = calculateLoanRepayValue(loan)

  return !!(loan.bondTradeTransaction.repaymentCallAmount / repayValueWithoutProtocolFee)
}

export const isFreezeLoan = (loan: Loan) => {
  return !!loan.bondTradeTransaction.terminationFreeze
}
