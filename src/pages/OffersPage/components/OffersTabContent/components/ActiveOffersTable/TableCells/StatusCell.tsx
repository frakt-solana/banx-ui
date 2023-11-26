import { FC } from 'react'

import { capitalize } from 'lodash'
import moment from 'moment'

import Timer from '@banx/components/Timer'

import { Loan } from '@banx/api/core'
import { SECONDS_IN_72_HOURS } from '@banx/constants'
import {
  LoanStatus,
  STATUS_LOANS_COLOR_MAP,
  calculateTimeFromNow,
  determineLoanStatus,
  isLoanLiquidated,
} from '@banx/utils'

import styles from '../ActiveLoansTable.module.less'

interface StatusCellProps {
  loan: Loan
}

export const StatusCell: FC<StatusCellProps> = ({ loan }) => {
  const loanStatus = determineLoanStatus(loan)

  const statusColor = STATUS_LOANS_COLOR_MAP[loanStatus as LoanStatus] || ''
  const timeInfo = calculateTimeInfo(loan, loanStatus)

  return (
    <div className={styles.statusInfo}>
      <span style={{ color: statusColor }} className={styles.statusInfoSubtitle}>
        {capitalize(loanStatus)}
      </span>
      <span className={styles.statusInfoTitle}>{timeInfo}</span>
    </div>
  )
}

const calculateTimeInfo = (loan: Loan, status: string) => {
  const { fraktBond, bondTradeTransaction } = loan

  const currentTimeInSeconds = moment().unix()
  const timeSinceActivationInSeconds = currentTimeInSeconds - bondTradeTransaction.soldAt
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
