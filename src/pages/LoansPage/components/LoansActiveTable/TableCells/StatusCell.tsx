import { FC } from 'react'

import { capitalize } from 'lodash'
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

import styles from '../LoansActiveTable.module.less'

interface StatusCellProps {
  loan: Loan
  isCardView: boolean
}

export const StatusCell: FC<StatusCellProps> = ({ loan, isCardView }) => {
  const { bondTradeTransaction } = loan

  const statusText = STATUS_LOANS_MAP[bondTradeTransaction.bondTradeTransactionState] || ''
  const statusColor = STATUS_LOANS_COLOR_MAP[statusText as LoanStatus] || ''

  const timeInfo = calculateTimeInfo(loan, statusText)

  const statusInfoTitle = <span className={styles.statusInfoTitle}>{timeInfo}</span>
  const statusInfoSubtitle = (
    <span style={{ color: statusColor }} className={styles.statusInfoSubtitle}>
      {capitalize(statusText)}
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
