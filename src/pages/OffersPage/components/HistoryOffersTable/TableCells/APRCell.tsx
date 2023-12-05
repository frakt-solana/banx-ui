import { FC } from 'react'

import { createPercentValueJSX } from '@banx/components/TableComponents'

import { LenderActivity } from '@banx/api/activity'

import styles from '../HistoryOffersTable.module.less'

interface APRCellProps {
  loan: LenderActivity
}

export const APRCell: FC<APRCellProps> = ({ loan }) => {
  const aprInPercent = loan.apr / 100

  return <span className={styles.aprValue}>{createPercentValueJSX(aprInPercent)}</span>
}
