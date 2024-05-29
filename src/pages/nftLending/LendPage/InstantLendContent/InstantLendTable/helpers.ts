import { core } from '@banx/api/nft'
import { BONDS, WEEKS_IN_YEAR } from '@banx/constants'
import { calculateApr, calculateLoanRepayValue, isLoanListed } from '@banx/utils'

type CalcWeeklyInterestFee = (Loan: core.Loan) => number
export const calcWeeklyInterestFee: CalcWeeklyInterestFee = (loan) => {
  const aprInPercent = loan.bondTradeTransaction.amountOfBonds / 100
  const aprWithProtocolFee = aprInPercent + BONDS.PROTOCOL_REPAY_FEE / 100
  const repayValue = calculateLendValue(loan)

  const weeklyAprPercentage = aprWithProtocolFee / 100 / WEEKS_IN_YEAR

  const weeklyFee = weeklyAprPercentage * repayValue

  return weeklyFee
}

export const calculateLendValue = (loan: core.Loan) => {
  const borrowedValue = loan.bondTradeTransaction.solAmount + loan.bondTradeTransaction.feeAmount
  const debtValue = calculateLoanRepayValue(loan)

  return isLoanListed(loan) ? borrowedValue : debtValue
}

export const calculateLenderApr = (loan: core.Loan) => {
  return calculateApr({
    loanValue: calculateLendValue(loan),
    collectionFloor: loan.nft.collectionFloor,
    marketPubkey: loan.fraktBond.hadoMarket,
  })
}