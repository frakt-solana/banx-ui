import moment from 'moment'

import { Loan } from '@banx/api/core'
import { WEEKS_IN_YEAR } from '@banx/constants'
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
  const apr = calculateAprIncrement(loan)
  const repayValue = calculateLoanRepayValue(loan)

  const weeklyAprPercentage = apr / 100 / WEEKS_IN_YEAR
  const weeklyFee = weeklyAprPercentage * repayValue

  return weeklyFee
}
