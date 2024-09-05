import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'

import { core } from '@banx/api/tokens'
import { SECONDS_IN_DAY } from '@banx/constants'
import {
  caclulateBorrowTokenLoanValue,
  calculateTokenLoanValueWithUpfrontFee,
  isTokenLoanListed,
} from '@banx/utils'

export const calculateLendToBorrowValue = (loan: core.TokenLoan) => {
  return isTokenLoanListed(loan)
    ? calculateTokenLoanValueWithUpfrontFee(loan).toNumber()
    : caclulateBorrowTokenLoanValue(loan).toNumber()
}

export const calcTokenWeeklyInterest = (loan: core.TokenLoan) => {
  const { soldAt, amountOfBonds } = loan.bondTradeTransaction

  return calculateCurrentInterestSolPure({
    loanValue: loan.bondTradeTransaction.amountOfBonds,
    startTime: soldAt,
    currentTime: soldAt + SECONDS_IN_DAY * 7,
    rateBasePoints: amountOfBonds,
  })
}
