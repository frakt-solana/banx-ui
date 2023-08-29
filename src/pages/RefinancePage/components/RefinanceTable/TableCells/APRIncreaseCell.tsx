import { FC } from 'react'

import moment from 'moment'

import Timer from '@banx/components/Timer/Timer'

import { Loan } from '@banx/api/core'

import { SECONDS_PER_HOUR } from '../constants'

interface APRIncreaseCellProps {
  loan: Loan
}

export const APRIncreaseCell: FC<APRIncreaseCellProps> = ({ loan }) => {
  const { refinanceAuctionStartedAt } = loan.fraktBond

  const currentTime = moment()
  const auctionStartTime = moment.unix(refinanceAuctionStartedAt)

  const secondsSinceStart = currentTime.diff(auctionStartTime, 'seconds')
  const elapsedHours = Math.floor(secondsSinceStart / SECONDS_PER_HOUR)

  const startTimeForNextRound = auctionStartTime.add(elapsedHours + 1, 'hours').unix()

  return <Timer expiredAt={startTimeForNextRound} detailedTimeFormat />
}
