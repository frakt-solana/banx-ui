import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'

import { Loan } from '@banx/api/core'
import { SECONDS_IN_72_HOURS } from '@banx/constants'

export enum LoanStatus {
  Active = 'active',
  Repaid = 'repaid',
  PartialRepaid = 'partial repaid',
  Liquidated = 'liquidated',
  Terminating = 'terminating',
}

export const STATUS_LOANS_MAP: Record<string, string> = {
  [BondTradeTransactionV2State.PerpetualActive]: LoanStatus.Active,
  [BondTradeTransactionV2State.PerpetualRepaid]: LoanStatus.Repaid,
  [BondTradeTransactionV2State.PerpetualPartialRepaid]: LoanStatus.PartialRepaid,
  [BondTradeTransactionV2State.PerpetualLiquidatedByClaim]: LoanStatus.Liquidated,
  [BondTradeTransactionV2State.PerpetualManualTerminating]: LoanStatus.Terminating,
}

export const STATUS_LOANS_COLOR_MAP: Record<LoanStatus, string> = {
  [LoanStatus.Active]: 'var(--additional-green-primary-deep)',
  [LoanStatus.Repaid]: 'var(--additional-green-primary-deep)',
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
    rateBasePoints: amountOfBonds,
  })

  return loanValueWithFee + calculatedInterest
}
