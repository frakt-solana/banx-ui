import { FC, useEffect, useState } from 'react'

import moment from 'moment'

import Timer from '@banx/components/Timer/Timer'

import { Loan } from '@banx/api/core'

import { SECONDS_PER_HOUR } from '../constants'

interface APRIncreaseCellProps {
  loan: Loan
}

export const APRIncreaseCell: FC<APRIncreaseCellProps> = ({ loan }) => {
  const { refinanceAuctionStartedAt } = loan.fraktBond

  const auctionStartTime = moment.unix(refinanceAuctionStartedAt)

  const [currentTime, setCurrentTime] = useState(moment())
  const [nextRoundStartTime, setNextRoundStartTime] = useState(
    auctionStartTime.add(1, 'hours').unix(),
  )

  const updateCurrentTime = () => {
    setCurrentTime(moment())
  }

  useEffect(() => {
    const interval = setInterval(updateCurrentTime, 1000) // Update current time every second

    return () => {
      clearInterval(interval)
    }
  }, [])

  const secondsSinceStart = currentTime.diff(auctionStartTime, 'seconds')
  const elapsedHours = Math.floor(secondsSinceStart / SECONDS_PER_HOUR)

  const shouldRestartTimer = currentTime >= moment.unix(nextRoundStartTime)

  if (shouldRestartTimer) {
    setNextRoundStartTime(auctionStartTime.add(elapsedHours + 1, 'hours').unix())
  }

  return <Timer expiredAt={nextRoundStartTime} detailedTimeFormat />
}
