import { FC } from 'react'

import { BorrowerActivity } from '@banx/api/core'
import { LoanStatus, STATUS_LOANS_COLOR_MAP, STATUS_LOANS_MAP } from '@banx/utils'

import styles from '../LoansHistoryTable.module.less'

interface StatusCellProps {
  loan: BorrowerActivity
}

export const StatusCell: FC<StatusCellProps> = ({ loan }) => {
  const loanStatus = STATUS_LOANS_MAP[loan.status]
  const statusColor = STATUS_LOANS_COLOR_MAP[loanStatus as LoanStatus]

  return (
    <span style={{ color: statusColor }} className={styles.statusCellTitle}>
      {loanStatus}
    </span>
  )
}
