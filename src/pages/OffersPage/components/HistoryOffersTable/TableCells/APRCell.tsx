import { FC } from 'react'

import { LenderActivity } from '@banx/api/activity'
import { HealthColorDecreasing, convertAprToApy, getColorByPercent } from '@banx/utils'

import styles from '../HistoryOffersTable.module.less'

interface APRCellProps {
  loan: LenderActivity
}

export const APRCell: FC<APRCellProps> = ({ loan }) => {
  const aprPercent = loan.apr / 100

  const colorAPR = getColorByPercent(aprPercent, HealthColorDecreasing)

  return (
    <span style={{ color: colorAPR }} className={styles.aprValue}>
      {convertAprToApy(aprPercent / 100)}%
    </span>
  )
}
