import { FC, useEffect, useRef, useState } from 'react'

import moment from 'moment'

import { Loan } from '@banx/api/core'
import { ColorByPercentHealth, getColorByPercent } from '@banx/utils'

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

  const colorAPR = getColorByPercent(currentAPR, ColorByPercentHealth)

  return (
    <span style={{ color: colorAPR }} className={styles.aprCellValue}>
      {currentAPR}%
    </span>
  )
}
