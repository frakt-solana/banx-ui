import moment from 'moment'

import { Loan } from '@banx/api/core'
import { BONDS, WEEKS_IN_YEAR } from '@banx/constants'
import { calculateLoanRepayValue } from '@banx/utils'

export const calculateAprIncrement = (loan: Loan) => {
  const { amountOfBonds } = loan.bondTradeTransaction
  const { refinanceAuctionStartedAt } = loan.fraktBond

  const currentTime = moment()
  const auctionStartTime = moment.unix(refinanceAuctionStartedAt)
  const hoursSinceStart = currentTime.diff(auctionStartTime, 'hours')

  const aprIncrement = amountOfBonds / 100 + hoursSinceStart

  return aprIncrement
}

type CalcWeeklyInterestFee = (Loan: Loan) => number
export const calcWeeklyInterestFee: CalcWeeklyInterestFee = (loan) => {
  //? calculate weekly interest with default apr
  const aprInPercent = loan.bondTradeTransaction.amountOfBonds / 100
  const aprWithProtocolFee = aprInPercent + BONDS.PROTOCOL_REPAY_FEE / 100
  const repayValue = calculateLoanRepayValue(loan)

  const weeklyAprPercentage = aprWithProtocolFee / 100 / WEEKS_IN_YEAR

  //? calculate weekly interest with incremented apr
  // const aprIncrement = calculateAprIncrement(loan)
  // const aprIncrementWithProtocolFee = aprIncrement + BONDS.PROTOCOL_REPAY_FEE / 100
  // const weeklyAprPercentage = aprIncrementWithProtocolFee / 100 / WEEKS_IN_YEAR

  const weeklyFee = weeklyAprPercentage * repayValue

  return weeklyFee
}
