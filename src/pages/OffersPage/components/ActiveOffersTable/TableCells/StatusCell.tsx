import { FC } from 'react'

import moment from 'moment'

import Timer from '@banx/components/Timer'

import { Loan } from '@banx/api/core'
import {
  LoanStatus,
  STATUS_LOANS_COLOR_MAP,
  STATUS_LOANS_MAP,
  calculateTimeFromNow,
} from '@banx/utils'

import { SECONDS_IN_72_HOURS } from '../constants'
import { isLoanExpired } from '../helpers'

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
  const { fraktBond, bondTradeTransaction } = loan

  const currentTimeInSeconds = moment().unix()
  const timeSinceActivationInSeconds = currentTimeInSeconds - bondTradeTransaction.soldAt
  const expiredAt = fraktBond.refinanceAuctionStartedAt + SECONDS_IN_72_HOURS

  const isExpiredLoan = isLoanExpired(loan)

  if (status === LoanStatus.Terminating && !isExpiredLoan) {
    return <Timer expiredAt={expiredAt} />
  }

  if (status === LoanStatus.Active || isExpiredLoan) {
    return calculateTimeFromNow(timeSinceActivationInSeconds)
  }

  return ''
}

const determineLoanStatus = (loan: Loan) => {
  const { bondTradeTransactionState } = loan.bondTradeTransaction

  const mappedStatus = STATUS_LOANS_MAP[bondTradeTransactionState]

  if (mappedStatus !== LoanStatus.Active && isLoanExpired(loan)) {
    return LoanStatus.Liquidated
  }

  return mappedStatus
}
