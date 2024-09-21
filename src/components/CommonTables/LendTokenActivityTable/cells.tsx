import { FC } from 'react'

import { capitalize } from 'lodash'

import { createPercentValueJSX } from '@banx/components/TableComponents'

import { activity } from '@banx/api/tokens'
import {
  LoanStatus,
  STATUS_LOANS_COLOR_MAP,
  STATUS_LOANS_MAP_WITH_REFINANCED_ACTIVE,
} from '@banx/utils'

import styles from './LendTokenActivityTable.module.less'

export const StatusCell: FC<{ loan: activity.LenderTokenActivity }> = ({ loan }) => {
  const loanStatus = STATUS_LOANS_MAP_WITH_REFINANCED_ACTIVE[loan.status]
  const statusColor = STATUS_LOANS_COLOR_MAP[loanStatus as LoanStatus]

  return (
    <span style={{ color: statusColor }} className={styles.cellTitle}>
      {capitalize(loanStatus)}
    </span>
  )
}

export const AprCell: FC<{ loan: activity.LenderTokenActivity }> = ({ loan }) => {
  const aprInPercent = loan.apr / 100

  return <span className={styles.cellTitle}>{createPercentValueJSX(aprInPercent)}</span>
}
