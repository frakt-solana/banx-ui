import { FC } from 'react'

import moment from 'moment'

import Timer from '@banx/components/Timer'

import { Loan } from '@banx/api/core'
import { SECONDS_IN_72_HOURS } from '@banx/pages/LoansPage/constants'
import {
  LoanStatus,
  STATUS_LOANS_COLOR_MAP,
  STATUS_LOANS_MAP,
  calculateTimeFromNow,
} from '@banx/utils'

import styles from '../LoansTable.module.less'

export const StatusCell: FC<{ loan: Loan }> = ({ loan }) => {
  const { bondTradeTransaction } = loan

  const statusText = STATUS_LOANS_MAP[bondTradeTransaction.bondTradeTransactionState] || ''
  const statusColor = STATUS_LOANS_COLOR_MAP[statusText as LoanStatus] || ''

  const timeInfo = calculateTimeInfo(loan, statusText)

  return (
    <div className={styles.statusInfo}>
      <span className={styles.statusInfoTitle}>{timeInfo}</span>
      <span style={{ color: statusColor }} className={styles.statusInfoSubtitle}>
        {statusText}
      </span>
    </div>
  )
}

const calculateTimeInfo = (loan: Loan, status: string) => {
  const { fraktBond } = loan

  const currentTimeInSeconds = moment().unix()
  const timeSinceActivationInSeconds = currentTimeInSeconds - fraktBond.activatedAt

  if (status === LoanStatus.Active) {
    return calculateTimeFromNow(timeSinceActivationInSeconds)
  }

  if (status === LoanStatus.Terminating) {
    const expiredAt = fraktBond.refinanceAuctionStartedAt + SECONDS_IN_72_HOURS
    return <Timer expiredAt={expiredAt} />
  }

  return ''
}
