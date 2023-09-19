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
  isCardView: boolean
}

export const StatusCell: FC<StatusCellProps> = ({ loan, isCardView }) => {
  const loanStatus = determineLoanStatus(loan)

  const statusColor = STATUS_LOANS_COLOR_MAP[loanStatus as LoanStatus] || ''
  const timeInfo = calculateTimeInfo(loan, loanStatus)

  const statusInfoTitle = <span className={styles.statusInfoTitle}>{timeInfo}</span>
  const statusInfoSubtitle = (
    <span style={{ color: statusColor }} className={styles.statusInfoSubtitle}>
      {loanStatus}
    </span>
  )

  return !isCardView ? (
    <div className={styles.statusInfo}>
      {statusInfoSubtitle}
      {statusInfoTitle}
    </div>
  ) : (
    <span>
      {statusInfoSubtitle} ({statusInfoTitle})
    </span>
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
