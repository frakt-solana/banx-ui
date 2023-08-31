import { FC } from 'react'

import { LenderActivity } from '@banx/api/core'
import { ColorByPercentHealth, getColorByPercent } from '@banx/utils'

import styles from '../HistoryOffersTable.module.less'

interface APRCellProps {
  loan: LenderActivity
}

export const APRCell: FC<APRCellProps> = ({ loan }) => {
  const aprPercent = loan.apr / 100

  const colorAPR = getColorByPercent(aprPercent, ColorByPercentHealth)

  return (
    <span style={{ color: colorAPR }} className={styles.aprValue}>
      {aprPercent}%
    </span>
  )
}
