import { FC } from 'react'

import moment from 'moment'

import { Loan } from '@banx/api/core'
import { HealthColorDecreasing, convertAprToApy, getColorByPercent } from '@banx/utils'

import { INCREASE_PERCENT_APR_PER_HOUR, MAX_APY_INCREASE_PERCENT } from '../constants'

import styles from '../RefinanceTable.module.less'

interface APRCellProps {
  loan: Loan
}

export const APRCell: FC<APRCellProps> = ({ loan }) => {
  const { amountOfBonds } = loan.bondTradeTransaction
  const { refinanceAuctionStartedAt } = loan.fraktBond

  const currentTime = moment()
  const auctionStartTime = moment.unix(refinanceAuctionStartedAt)
  const hoursSinceStart = currentTime.diff(auctionStartTime, 'hours')

  const apr = amountOfBonds / 100 + hoursSinceStart

  const colorAPR = getColorByPercent(apr, HealthColorDecreasing)

  const apy = Math.min(convertAprToApy(apr / 100), MAX_APY_INCREASE_PERCENT)

  const isApyIncreaseRateVisible = apy < MAX_APY_INCREASE_PERCENT

  return (
    <span style={{ color: colorAPR }} className={styles.aprValue}>
      {apy}% {isApyIncreaseRateVisible ? `(+${INCREASE_PERCENT_APR_PER_HOUR}%)` : null}
    </span>
  )
}
