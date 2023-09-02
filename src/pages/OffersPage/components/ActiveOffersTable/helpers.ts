import { calculateCurrentInterestSolPure } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import moment from 'moment'

import { Loan } from '@banx/api/core'

import { SECONDS_IN_72_HOURS } from './constants'

export const isLoanExpired = (loan: Loan) => {
  const { fraktBond } = loan

  if (!fraktBond.refinanceAuctionStartedAt) return false

  const currentTimeInSeconds = moment().unix()

  const expiredAt = fraktBond.refinanceAuctionStartedAt + SECONDS_IN_72_HOURS

  return currentTimeInSeconds > expiredAt
}

export const calculateLoanRepayValue = (loan: Loan) => {
  const { solAmount, feeAmount, soldAt, amountOfBonds } = loan.bondTradeTransaction || {}

  const calculatedInterest = calculateCurrentInterestSolPure({
    loanValue: solAmount + feeAmount,
    startTime: soldAt,
    currentTime: moment().unix(),
    rateBasePoints: amountOfBonds,
  })

  return solAmount + feeAmount + calculatedInterest
}
