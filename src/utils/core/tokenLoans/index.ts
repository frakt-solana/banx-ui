import { BN } from 'fbonds-core'
import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'

import { core } from '@banx/api/tokens'
import { BONDS, SECONDS_IN_72_HOURS } from '@banx/constants'

export const isTokenLoanFrozen = (loan: core.TokenLoan) => {
  return !!loan.bondTradeTransaction.terminationFreeze
}

export const isTokenLoanListed = (loan: core.TokenLoan) => {
  return (
    loan.bondTradeTransaction.bondTradeTransactionState ===
    BondTradeTransactionV2State.PerpetualBorrowerListing
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

export const caclulateBorrowTokenLoanValue = (loan: core.TokenLoan, includeFee = true) => {
  const { solAmount, feeAmount, soldAt, amountOfBonds } = loan.bondTradeTransaction

  const loanValue = includeFee ? solAmount + feeAmount : solAmount

  const currentTimeInSeconds = moment().unix()

  const calculatedInterest = calculateCurrentInterestSolPure({
    loanValue: amountOfBonds,
    startTime: soldAt,
    currentTime: currentTimeInSeconds,
    rateBasePoints: amountOfBonds + BONDS.PROTOCOL_REPAY_FEE,
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
