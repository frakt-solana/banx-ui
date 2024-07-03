import { core } from '@banx/api/tokens'
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
