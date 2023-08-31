import moment from 'moment'

import { Loan } from '@banx/api/core'

import { SECONDS_IN_72_HOURS } from './constants'

export const isLoanExpired = (loan: Loan) => {
  const { fraktBond } = loan

  const currentTimeInSeconds = moment().unix()

  const expiredAt = fraktBond.refinanceAuctionStartedAt + SECONDS_IN_72_HOURS

  return currentTimeInSeconds > expiredAt
}
