import { FC } from 'react'

import moment from 'moment'

import Timer from '@banx/components/Timer'

import { Loan } from '@banx/api/core'
import {
  LoanStatus,
  STATUS_LOANS_COLOR_MAP,
  calculateTimeFromNow,
  determineLoanStatus,
  isLoanLiquidated,
} from '@banx/utils'

import { SECONDS_IN_72_HOURS } from '../constants'

import styles from '../ActiveOffersTable.module.less'

interface StatusCellProps {
  loan: Loan
}

export const StatusCell: FC<StatusCellProps> = ({ loan }) => {
  const loanStatus = determineLoanStatus(loan)

  const statusColor = STATUS_LOANS_COLOR_MAP[loanStatus as LoanStatus] || ''
  const timeInfo = calculateTimeInfo(loan, loanStatus)

  return (
    <div className={styles.statusInfo}>
      <span className={styles.statusInfoTitle}>{timeInfo}</span>
      <span style={{ color: statusColor }} className={styles.statusInfoSubtitle}>
        {loanStatus}
      </span>
    </div>
  )
}

const calculateTimeInfo = (loan: Loan, status: string) => {
  const { fraktBond } = loan

  const currentTimeInSeconds = moment().unix()
  const timeSinceActivationInSeconds = currentTimeInSeconds - fraktBond.activatedAt
  const expiredAt = fraktBond.refinanceAuctionStartedAt + SECONDS_IN_72_HOURS

  const isLiquidatedLoan = isLoanLiquidated(loan)

  if (status === LoanStatus.Terminating && !isLiquidatedLoan) {
    return <Timer expiredAt={expiredAt} />
  }

  if (status === LoanStatus.Active || isLiquidatedLoan) {
    return calculateTimeFromNow(timeSinceActivationInSeconds)
  }

  return ''
}
