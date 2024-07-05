import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { core } from '@banx/api/tokens'
import { BONDS, SECONDS_IN_DAY } from '@banx/constants'
import {
  caclulateBorrowTokenLoanValue,
  calculateApr,
  calculateTokenLoanValueWithUpfrontFee,
  isTokenLoanListed,
  isTokenLoanTerminating,
} from '@banx/utils'

export const calculateLendToBorrowValue = (loan: core.TokenLoan) => {
  return isTokenLoanListed(loan)
    ? calculateTokenLoanValueWithUpfrontFee(loan).toNumber()
    : caclulateBorrowTokenLoanValue(loan).toNumber()
}

export const calculateLendToBorrowApr = (loan: core.TokenLoan) => {
  const isTerminatingStatus = isTokenLoanTerminating(loan)

  const calculatedApr = calculateApr({
    loanValue: calculateLendToBorrowValue(loan),
    collectionFloor: loan.collateralPrice,
    marketPubkey: loan.fraktBond.hadoMarket,
  })

  return isTerminatingStatus ? calculatedApr : loan.bondTradeTransaction.amountOfBonds
}

export const calcTokenWeeklyInterest = (loan: core.TokenLoan) => {
  const { soldAt, amountOfBonds } = loan.bondTradeTransaction

  return calculateCurrentInterestSolPure({
    loanValue: calculateLendToBorrowValue(loan),
    startTime: soldAt,
    currentTime: soldAt + SECONDS_IN_DAY * 7,
    rateBasePoints: amountOfBonds + BONDS.PROTOCOL_REPAY_FEE,
  })
}
