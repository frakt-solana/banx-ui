import { FC, useEffect, useRef, useState } from 'react'

import moment from 'moment'

import { Loan } from '@banx/api/core'
import { HealthColorDecreasing, convertAprToApy, getColorByPercent } from '@banx/utils'

import { INCREASE_PERCENT_APR_PER_HOUR, MAX_INCREASE_PERCENT } from '../constants'

import styles from '../RefinanceTable.module.less'

interface APRCellProps {
  loan: Loan
}

export const APRCell: FC<APRCellProps> = ({ loan }) => {
  const { amountOfBonds } = loan.bondTradeTransaction
  const { refinanceAuctionStartedAt } = loan.fraktBond

  const [currentAPR, setCurrentAPR] = useState<number>(0)

  const prevHoursSinceStartRef = useRef<number | null>(null)

  useEffect(() => {
    const calculateUpdatedAPR = () => {
      const currentTime = moment()
      const auctionStartTime = moment.unix(refinanceAuctionStartedAt)
      const hoursSinceStart = currentTime.diff(auctionStartTime, 'hours')

      if (hoursSinceStart !== prevHoursSinceStartRef.current) {
        const updatedAPR = amountOfBonds / 100 + hoursSinceStart
        setCurrentAPR(updatedAPR)

        prevHoursSinceStartRef.current = hoursSinceStart
      }
    }

    calculateUpdatedAPR()
    const interval = setInterval(calculateUpdatedAPR, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [refinanceAuctionStartedAt, amountOfBonds])

  const colorAPR = getColorByPercent(currentAPR, HealthColorDecreasing)

  const apy = Math.min(convertAprToApy(currentAPR / 100), MAX_INCREASE_PERCENT)

  const shouldShowIncreaseInApy = apy < MAX_INCREASE_PERCENT

  return (
    <span style={{ color: colorAPR }} className={styles.aprValue}>
      {apy}% {shouldShowIncreaseInApy ? `(+${INCREASE_PERCENT_APR_PER_HOUR}%)` : null}
    </span>
  )
}
