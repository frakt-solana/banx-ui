import { FC } from 'react'

import { capitalize } from 'lodash'
import moment from 'moment'

import Timer from '@banx/components/Timer'

import { core } from '@banx/api/nft'
import { SECONDS_IN_72_HOURS } from '@banx/constants'
import {
  LoanStatus,
  STATUS_LOANS_COLOR_MAP,
  calculateTimeFromNow,
  determineLoanStatus,
  isLoanLiquidated,
} from '@banx/utils'

import styles from '../LoansTable.module.less'

interface StatusCellProps {
  loan: core.Loan
  isCardView?: boolean
}

export const StatusCell: FC<StatusCellProps> = ({ loan, isCardView = false }) => {
  const loanStatus = determineLoanStatus(loan)

  const statusColor = STATUS_LOANS_COLOR_MAP[loanStatus as LoanStatus] || ''
  const timeInfo = calculateTimeInfo(loan, loanStatus)

  const statusInfoTitle = <span className={styles.statusInfoTitle}>{timeInfo}</span>
  const statusInfoSubtitle = (
    <span style={{ color: statusColor }} className={styles.statusInfoSubtitle}>
      {capitalize(loanStatus)}
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

const calculateTimeInfo = (loan: core.Loan, status: string) => {
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
