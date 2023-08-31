import { FC } from 'react'

import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'

import Timer from '@banx/components/Timer'

import { LenderActivity, Loan } from '@banx/api/core'
import { calculateTimeFromNow } from '@banx/utils'

import { SECONDS_IN_72_HOURS } from '../constants'

import styles from '../HistoryOffersTable.module.less'

interface StatusCellProps {
  loan: LenderActivity
}

enum LoanStatus {
  Active = 'active',
  Terminating = 'terminating',
  Liquidated = 'liquidated',
  Repaid = 'repaid',
}

const STATUS_LOANS_MAP: Record<string, string> = {
  [BondTradeTransactionV2State.PerpetualActive]: LoanStatus.Active,
  [BondTradeTransactionV2State.PerpetualManualTerminating]: LoanStatus.Terminating,
  [BondTradeTransactionV2State.PerpetualRepaid]: LoanStatus.Repaid,
}

const STATUS_COLOR_MAP: Record<LoanStatus, string> = {
  [LoanStatus.Active]: 'var(--additional-green-primary-deep)',
  [LoanStatus.Terminating]: 'var(--additional-lava-primary-deep)',
  [LoanStatus.Liquidated]: 'var(--additional-red-primary-deep)',
  [LoanStatus.Repaid]: 'var(--additional-green-primary-deep)',
}

export const StatusCell: FC<StatusCellProps> = ({ loan }) => {
  const loanStatus = STATUS_LOANS_MAP[loan.status] || ''

  console.log(loan.status)

  const statusColor = STATUS_COLOR_MAP[loanStatus as LoanStatus] || ''

  // const timeInfo = calculateTimeInfo(loan, statusText)

  return (
    <div className={styles.statusCell}>
      {/* <span className={styles.statusCellTitle}>{timeInfo}</span> */}
      <span style={{ color: statusColor }} className={styles.statusCellSubtitle}>
        {loanStatus}
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

  return '--'
}
