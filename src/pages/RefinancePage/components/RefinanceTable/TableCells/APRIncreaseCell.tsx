import { FC, useEffect, useState } from 'react'

import moment from 'moment'

import Timer from '@banx/components/Timer/Timer'

import { Loan } from '@banx/api/core'
import { convertAprToApy } from '@banx/utils'

import { MAX_APY_INCREASE_PERCENT, SECONDS_IN_HOUR } from '../constants'
import { calculateAprIncrement } from '../helpers'

interface APRIncreaseCellProps {
  loan: Loan
}

export const APRIncreaseCell: FC<APRIncreaseCellProps> = ({ loan }) => {
  const { refinanceAuctionStartedAt } = loan.fraktBond
  const aprIncrement = calculateAprIncrement(loan)
  const apyIncrement = convertAprToApy(aprIncrement / 100)

  const auctionStartTime = moment.unix(refinanceAuctionStartedAt)

  const [currentTime, setCurrentTime] = useState(moment())
  const [nextRoundStartTime, setNextRoundStartTime] = useState(
    auctionStartTime.add(1, 'hours').unix(),
  )

  const updateCurrentTime = () => {
    setCurrentTime(moment())
  }

  useEffect(() => {
    const interval = setInterval(updateCurrentTime, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const secondsSinceStart = currentTime.diff(auctionStartTime, 'seconds')
  const elapsedHours = Math.floor(secondsSinceStart / SECONDS_IN_HOUR)

  const shouldRestartTimer = currentTime >= moment.unix(nextRoundStartTime)

  if (shouldRestartTimer) {
    setNextRoundStartTime(auctionStartTime.add(elapsedHours + 1, 'hours').unix())
  }

  return apyIncrement >= MAX_APY_INCREASE_PERCENT ? (
    <>Limit reached</>
  ) : (
    <Timer expiredAt={nextRoundStartTime} />
  )
}
