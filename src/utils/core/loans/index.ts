import { BN } from 'fbonds-core'
import { BASE_POINTS, SECONDS_IN_DAY } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  calculateCurrentInterestSolPure,
  calculateDynamicApr,
  calculateLenderPartialPartFromBorrower,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondTradeTransactionV2State, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { isInteger } from 'lodash'
import moment from 'moment'

import { core } from '@banx/api/nft'
import {
  BONDS,
  DYNAMIC_APR,
  FACELESS_MARKET_PUBKEY,
  NFT_MARKETS_WITH_CUSTOM_APR,
  SECONDS_IN_72_HOURS,
} from '@banx/constants'

import { RENT_FEE_BORROW_AMOUNT_IMPACT } from '../../tokens'

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

export const isLoanLiquidated = (loan: core.Loan) => {
  const { fraktBond } = loan

  if (!fraktBond.refinanceAuctionStartedAt) return false

  const currentTimeInSeconds = moment().unix()

  const expiredAt = fraktBond.refinanceAuctionStartedAt + SECONDS_IN_72_HOURS

  return currentTimeInSeconds > expiredAt
}

export const determineLoanStatus = (loan: core.Loan) => {
  const { bondTradeTransactionState } = loan.bondTradeTransaction

  const mappedStatus = STATUS_LOANS_MAP[bondTradeTransactionState]

  if (mappedStatus !== LoanStatus.Active && isLoanLiquidated(loan)) {
    return LoanStatus.Liquidated
  }

  return mappedStatus
}

export const calculateLoanRepayValue = (loan: core.Loan, includeFee = true) => {
  const repayValueBN = calculateLoanRepayValueOnCertainDate({
    loan,
    upfrontFeeIncluded: includeFee,
    date: moment().unix(),
  })

  return repayValueBN.toNumber()
}

type CalculateLoanRepayValueOnCertainDate = (params: {
  loan: core.Loan
  upfrontFeeIncluded?: boolean
  date: number //? Unix timestamp
}) => BN
export const calculateLoanRepayValueOnCertainDate: CalculateLoanRepayValueOnCertainDate = ({
  loan,
  upfrontFeeIncluded = true,
  date,
}) => {
  const { solAmount, feeAmount, soldAt, amountOfBonds } = loan.bondTradeTransaction || {}

  const loanValue = upfrontFeeIncluded ? solAmount + feeAmount : solAmount

  const calculatedInterest = calculateCurrentInterestSolPure({
    loanValue,
    startTime: soldAt,
    currentTime: date,
    rateBasePoints: amountOfBonds + BONDS.PROTOCOL_REPAY_FEE,
  })

  return new BN(loanValue).add(new BN(calculatedInterest))
}

export const formatLoansAmount = (loansAmount = 0) => {
  if (isInteger(loansAmount)) {
    return String(loansAmount)
  }

  return loansAmount.toFixed(2)
}

export const calcLoanBorrowedAmount = (loan: core.Loan) => {
  const { solAmount, feeAmount } = loan.bondTradeTransaction
  return solAmount + feeAmount
}

export const isLoanActive = (loan: core.Loan) => {
  const status = determineLoanStatus(loan)
  return status === LoanStatus.Active
}

export const isLoanActiveOrRefinanced = (loan: core.Loan) => {
  //? Add RefinancedActive in future
  return isLoanActive(loan)
  // const status = determineLoanStatus(loan)
  // return status === LoanStatus.Active || status === LoanStatus.Refinanced
}

export const isLoanRepaid = (loan: core.Loan) => {
  const status = determineLoanStatus(loan)
  return status === LoanStatus.Repaid
}

export const isLoanTerminating = (loan: core.Loan) => {
  const { bondTradeTransactionState } = loan.bondTradeTransaction || {}

  const mappedStatus = STATUS_LOANS_MAP[bondTradeTransactionState] || ''
  return mappedStatus === LoanStatus.Terminating
}

export const isUnderWaterLoan = (loan: core.Loan) => {
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
  const customApr = NFT_MARKETS_WITH_CUSTOM_APR[marketPubkey || '']
  if (customApr !== undefined) {
    return customApr
  }

  const staticApr = Math.floor((loanValue / collectionFloor) * BASE_POINTS) || 0
  return calculateDynamicApr(staticApr, DYNAMIC_APR)
}

export const calcWeeklyFeeWithRepayFee = (loan: core.Loan) => {
  const { soldAt, amountOfBonds } = loan.bondTradeTransaction

  return calculateCurrentInterestSolPure({
    loanValue: calcLoanBorrowedAmount(loan),
    startTime: soldAt,
    currentTime: soldAt + SECONDS_IN_DAY * 7,
    rateBasePoints: amountOfBonds + BONDS.PROTOCOL_REPAY_FEE,
  })
}

export const isLoanRepaymentCallActive = (loan: core.Loan) => {
  if (!loan.bondTradeTransaction.repaymentCallAmount || isLoanTerminating(loan)) return false

  const repayValueWithoutProtocolFee = calculateLoanRepayValue(loan)

  return !!(loan.bondTradeTransaction.repaymentCallAmount / repayValueWithoutProtocolFee)
}

export const isFreezeLoan = (loan: core.Loan) => {
  return !!loan.bondTradeTransaction.terminationFreeze
}

export const isLoanListed = (loan: core.Loan) => {
  return (
    loan.bondTradeTransaction.bondTradeTransactionState ===
    BondTradeTransactionV2State.PerpetualBorrowerListing
  )
}

/**
  As we need to show how much lender receives. We need to calculate this value from repaymentCallAmount (how much borrower should pay)
 */
export const calculateRepaymentCallLenderReceivesAmount = (loan: core.Loan) => {
  const { repaymentCallAmount, soldAt, amountOfBonds } = loan.bondTradeTransaction

  return calculateLenderPartialPartFromBorrower({
    borrowerPart: repaymentCallAmount,
    protocolRepayFeeApr: BONDS.PROTOCOL_REPAY_FEE,
    soldAt,
    //? Lender APR (without ProtocolFee)
    lenderApr: calculateApr({
      loanValue: amountOfBonds,
      collectionFloor: loan.nft.collectionFloor,
      marketPubkey: loan.fraktBond.hadoMarket,
    }),
  })
}

export const calculateFreezeExpiredAt = (loan: core.Loan) => {
  return loan.bondTradeTransaction.soldAt + loan.bondTradeTransaction.terminationFreeze
}

export const checkIfFreezeExpired = (loan: core.Loan) => {
  const freezeExpiredAt = calculateFreezeExpiredAt(loan)
  return moment().unix() > freezeExpiredAt
}

export const calcBorrowValueWithRentFee = (
  //TODO r: Move to loans
  loanValue: number,
  marketPubkey: string,
  tokenType: LendingTokenType,
) => {
  if (loanValue === 0) return 0
  if (marketPubkey === FACELESS_MARKET_PUBKEY) return loanValue

  const rentFee = RENT_FEE_BORROW_AMOUNT_IMPACT[tokenType]
  return loanValue - rentFee
}

export const calcBorrowValueWithProtocolFee = (
  loanValue: number, //TODO r: Move to loans
) => Math.floor(loanValue * (1 - BONDS.PROTOCOL_FEE_PERCENT / 1e4))
