import { FC } from 'react'

import { Loan } from '@banx/api/core'
import { ColorByPercentHealth, getColorByPercent } from '@banx/utils'

import styles from '../ActiveOffersTable.module.less'

interface APRCellProps {
  loan: Loan
}

export const APRCell: FC<APRCellProps> = ({ loan }) => {
  const { amountOfBonds } = loan.bondTradeTransaction || {}

  const aprPercent = amountOfBonds / 1e2

  const colorLTV = getColorByPercent(aprPercent, ColorByPercentHealth) || ColorByPercentHealth[100]

  return (
    <span style={{ color: colorLTV }} className={styles.aprValue}>
      {aprPercent}%
    </span>
  )
}
