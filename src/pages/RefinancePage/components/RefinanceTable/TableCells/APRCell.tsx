import { FC } from 'react'

import { Loan } from '@banx/api/core'
import { HealthColorDecreasing, convertAprToApy, getColorByPercent } from '@banx/utils'

import { INCREASE_PERCENT_APR_PER_HOUR, MAX_APY_INCREASE_PERCENT } from '../constants'
import { calculateAprIncrement } from '../helpers'

import styles from '../RefinanceTable.module.less'

interface APRCellProps {
  loan: Loan
}

export const APRCell: FC<APRCellProps> = ({ loan }) => {
  const aprIncrement = calculateAprIncrement(loan)

  const colorAPR = getColorByPercent(aprIncrement, HealthColorDecreasing)

  const apy = Math.min(convertAprToApy(aprIncrement / 100), MAX_APY_INCREASE_PERCENT)

  const isApyIncreaseRateVisible = apy < MAX_APY_INCREASE_PERCENT

  return (
    <span style={{ color: colorAPR }} className={styles.aprValue}>
      {apy}% {isApyIncreaseRateVisible ? `(+${INCREASE_PERCENT_APR_PER_HOUR}%)` : null}
    </span>
  )
}
