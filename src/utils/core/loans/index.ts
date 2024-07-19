import { BN, web3 } from 'fbonds-core'
import { BASE_POINTS, SECONDS_IN_DAY } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  calculateCurrentInterestSolPureBN,
  calculateDynamicApr,
  calculateLenderPartialPartFromBorrowerBN,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondTradeTransactionV2State, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'

import { coreNew } from '@banx/api/nft'
import {
  BONDS,
  DYNAMIC_APR,
  FACELESS_MARKET_PUBKEY,
  NFT_MARKETS_WITH_CUSTOM_APR,
  SECONDS_IN_72_HOURS,
  WEEKS_IN_YEAR,
} from '@banx/constants'
import { SOLANA_RENT_FEE_BORROW_AMOUNT_IMPACT } from '@banx/utils'
import { ZERO_BN } from '@banx/utils/bn'

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

export const isLoanLiquidated = (loan: coreNew.Loan) => {
  const { fraktBond } = loan

  if (!fraktBond.refinanceAuctionStartedAt) return false

  const currentTimeInSeconds = moment().unix()

  const expiredAt = fraktBond.refinanceAuctionStartedAt.toNumber() + SECONDS_IN_72_HOURS

  return currentTimeInSeconds > expiredAt
}

export const determineLoanStatus = (loan: coreNew.Loan) => {
  const { bondTradeTransactionState } = loan.bondTradeTransaction

  const mappedStatus = STATUS_LOANS_MAP[bondTradeTransactionState]

  if (mappedStatus !== LoanStatus.Active && isLoanLiquidated(loan)) {
    return LoanStatus.Liquidated
  }

  return mappedStatus
}

/**
 * set upfrontFeeIncluded false for partial repay
 */
export const calculateLoanRepayValue = (loan: coreNew.Loan, upfrontFeeIncluded = true) => {
  const repayValueBN = calculateLoanRepayValueOnCertainDate({
    loan,
    upfrontFeeIncluded,
    date: moment().unix(),
  })

  return repayValueBN
}

type CalculateLoanRepayValueOnCertainDate = (params: {
  loan: coreNew.Loan
  upfrontFeeIncluded?: boolean
  date: number //? Unix timestamp
}) => BN
/**
 * set upfrontFeeIncluded false for partial repay
 */
export const calculateLoanRepayValueOnCertainDate: CalculateLoanRepayValueOnCertainDate = ({
  loan,
  upfrontFeeIncluded = true,
  date,
}): BN => {
  const { solAmount, soldAt, amountOfBonds } = loan.bondTradeTransaction || {}

  const loanValue = upfrontFeeIncluded ? calculateBorrowedAmount(loan) : solAmount

  const calculatedInterest = calculateCurrentInterestSolPureBN({
    loanValue,
    startTime: soldAt,
    currentTime: new BN(date),
    rateBasePoints: amountOfBonds.add(BONDS.PROTOCOL_REPAY_FEE_BN),
  })

  return loanValue.add(calculatedInterest)
}

export const calculateBorrowedAmount = (loan: coreNew.Loan): BN => {
  const { solAmount, feeAmount } = loan.bondTradeTransaction
  return new BN(solAmount).add(new BN(feeAmount))
}

export const isLoanActive = (loan: coreNew.Loan) => {
  const status = determineLoanStatus(loan)
  return status === LoanStatus.Active
}

export const isLoanActiveOrRefinanced = (loan: coreNew.Loan) => {
  //? Add RefinancedActive in future
  return isLoanActive(loan)
  // const status = determineLoanStatus(loan)
  // return status === LoanStatus.Active || status === LoanStatus.Refinanced
}

export const isLoanRepaid = (loan: coreNew.Loan) => {
  const status = determineLoanStatus(loan)
  return status === LoanStatus.Repaid
}

export const isLoanTerminating = (loan: coreNew.Loan) => {
  const { bondTradeTransactionState } = loan.bondTradeTransaction || {}

  const mappedStatus = STATUS_LOANS_MAP[bondTradeTransactionState] || ''
  return mappedStatus === LoanStatus.Terminating
}

export const isUnderWaterLoan = (loan: coreNew.Loan) => {
  const collectionFloor = loan.nft.collectionFloor
  const totalLentValue = calculateBorrowedAmount(loan)

  return totalLentValue.gt(collectionFloor)
}

type CalculateApr = (params: {
  loanValue: BN
  collectionFloor: BN
  marketPubkey?: web3.PublicKey
}) => BN
/**
 * Returns apr value in base points: 7380 => 73.8%
 */
export const calculateApr: CalculateApr = ({ loanValue, collectionFloor, marketPubkey }) => {
  const marketPubkeyStr = marketPubkey?.toString() || ''

  //? exceptions for some collections with hardcoded APR
  const customApr = NFT_MARKETS_WITH_CUSTOM_APR[marketPubkeyStr || '']
  if (customApr !== undefined) {
    return new BN(customApr)
  }

  const staticApr = loanValue.mul(new BN(BASE_POINTS)).div(collectionFloor)
  return new BN(calculateDynamicApr(staticApr.toNumber(), DYNAMIC_APR))
}

export const calcWeeklyFeeWithRepayFee = (loan: coreNew.Loan) => {
  const { soldAt, amountOfBonds } = loan.bondTradeTransaction

  return calculateCurrentInterestSolPureBN({
    loanValue: calculateBorrowedAmount(loan),
    startTime: soldAt,
    currentTime: new BN(SECONDS_IN_DAY).mul(new BN(7)).add(soldAt),
    rateBasePoints: amountOfBonds.add(BONDS.PROTOCOL_REPAY_FEE_BN),
  })
}

export const isLoanRepaymentCallActive = (loan: coreNew.Loan) => {
  if (!loan.bondTradeTransaction.repaymentCallAmount || isLoanTerminating(loan)) return false

  const repayValueWithoutProtocolFee = calculateLoanRepayValue(loan)

  return !loan.bondTradeTransaction.repaymentCallAmount
    .div(repayValueWithoutProtocolFee)
    .eq(ZERO_BN)
}

export const isFreezeLoan = (loan: coreNew.Loan) => {
  return !!loan.bondTradeTransaction.terminationFreeze
}

export const isLoanListed = (loan: coreNew.Loan) => {
  return (
    loan.bondTradeTransaction.bondTradeTransactionState ===
    BondTradeTransactionV2State.PerpetualBorrowerListing
  )
}

/**
  As we need to show how much lender receives. We need to calculate this value from repaymentCallAmount (how much borrower should pay)
 */
export const calculateRepaymentCallLenderReceivesAmount = (loan: coreNew.Loan) => {
  const { repaymentCallAmount, soldAt, amountOfBonds } = loan.bondTradeTransaction

  return calculateLenderPartialPartFromBorrowerBN({
    borrowerPart: repaymentCallAmount,
    protocolRepayFeeApr: BONDS.PROTOCOL_REPAY_FEE_BN,
    soldAt,
    //? Lender APR (without ProtocolFee)
    lenderApr: calculateApr({
      loanValue: amountOfBonds,
      collectionFloor: loan.nft.collectionFloor,
      marketPubkey: loan.fraktBond.hadoMarket,
    }),
  })
}

export const calculateFreezeExpiredAt = (loan: coreNew.Loan): number => {
  return (
    loan.bondTradeTransaction.soldAt.toNumber() +
    loan.bondTradeTransaction.terminationFreeze.toNumber()
  )
}

export const checkIfFreezeExpired = (loan: coreNew.Loan) => {
  const freezeExpiredAt = calculateFreezeExpiredAt(loan)
  return moment().unix() > freezeExpiredAt
}

type AdjustBorrowValueWithSolanaRentFee = (params: {
  value: BN
  marketPubkey?: string
  tokenType: LendingTokenType
}) => BN
export const adjustBorrowValueWithSolanaRentFee: AdjustBorrowValueWithSolanaRentFee = ({
  value,
  marketPubkey,
  tokenType,
}) => {
  if (value.eq(ZERO_BN)) return ZERO_BN
  if (!!marketPubkey && marketPubkey === FACELESS_MARKET_PUBKEY) return value

  const rentFee = SOLANA_RENT_FEE_BORROW_AMOUNT_IMPACT[tokenType]
  return value.sub(new BN(rentFee))
}

export const calculateBorrowValueWithProtocolFee = (loanValue: BN): number =>
  Math.floor(loanValue.toNumber() * (1 - BONDS.PROTOCOL_FEE_PERCENT / 1e4))

export const calculateClaimValueOnCertainDate = (loan: coreNew.Loan, date: number): BN => {
  const { amountOfBonds, soldAt } = loan.bondTradeTransaction

  const loanBorrowedAmount = calculateBorrowedAmount(loan)

  const currentInterest = calculateCurrentInterestSolPureBN({
    loanValue: loanBorrowedAmount,
    startTime: soldAt,
    currentTime: new BN(date),
    rateBasePoints: amountOfBonds,
  })
  return currentInterest.add(loanBorrowedAmount)
}

export const calculateClaimValue = (loan: coreNew.Loan) => {
  const claimValueBN = calculateClaimValueOnCertainDate(loan, moment().unix())

  return claimValueBN.toNumber()
}

type CalcWeeklyInterestFee = (loan: coreNew.Loan) => BN
export const calcWeeklyInterestFee: CalcWeeklyInterestFee = (loan) => {
  const aprInPercentBasePoints = loan.bondTradeTransaction.amountOfBonds
  const aprWithProtocolFeeBasePoints = aprInPercentBasePoints.add(BONDS.PROTOCOL_REPAY_FEE_BN)
  const repayValue = calculateLendValue(loan)

  const weeklyAprPercentageBasePoints = aprWithProtocolFeeBasePoints.div(new BN(WEEKS_IN_YEAR))

  const weeklyFee = weeklyAprPercentageBasePoints.mul(repayValue).div(new BN(BASE_POINTS))

  return weeklyFee
}

/**
 * Returns apr value in base points: 7380 => 73.8%
 */
export const calculateLenderApr = (loan: coreNew.Loan) => {
  return calculateApr({
    loanValue: calculateLendValue(loan),
    collectionFloor: loan.nft.collectionFloor,
    marketPubkey: loan.fraktBond.hadoMarket,
  })
}

export const calculateLendValue = (loan: coreNew.Loan) => {
  return isLoanListed(loan) ? calculateBorrowedAmount(loan) : calculateLoanRepayValue(loan)
}

//TODO Refactor all helpers for Borrower/Lender. Now
//TODO It's realy difficult to understand what to use atm
//TODO Spit to common, lender, borrower utils
