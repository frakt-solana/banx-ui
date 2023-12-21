import { FC } from 'react'

import { createPercentValueJSX } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'

import styles from '../LoansTable.module.less'

interface APRCellProps {
  loan: Loan
}

export const APRCell: FC<APRCellProps> = ({ loan }) => {
  const { amountOfBonds } = loan.bondTradeTransaction || {}

  const aprPercent = amountOfBonds / 100

  return <span className={styles.aprValue}>{createPercentValueJSX(aprPercent)}</span>
}
