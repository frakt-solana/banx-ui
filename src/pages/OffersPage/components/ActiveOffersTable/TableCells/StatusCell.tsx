import { FC } from 'react'

import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'

import Timer from '@banx/components/Timer'

import { Loan } from '@banx/api/core'
import { calculateTimeFromNow } from '@banx/utils'

import { SECONDS_IN_72_HOURS } from '../constants'
import { isLoanExpired } from '../helpers'

import styles from '../ActiveOffersTable.module.less'

enum LoanStatus {
  Active = 'active',
  Terminating = 'terminating',
  Liquidated = 'liquidated',
}

const LOAN_STATUS_MAP: Record<string, string> = {
  [BondTradeTransactionV2State.PerpetualActive]: LoanStatus.Active,
  [BondTradeTransactionV2State.PerpetualManualTerminating]: LoanStatus.Terminating,
}

const LOAN_STATUS_COLOR_MAP: Record<LoanStatus, string> = {
  [LoanStatus.Active]: 'var(--additional-green-primary-deep)',
  [LoanStatus.Terminating]: 'var(--additional-lava-primary-deep)',
  [LoanStatus.Liquidated]: 'var(--additional-red-primary-deep)',
}

interface StatusCellProps {
  loan: Loan
}

export const StatusCell: FC<StatusCellProps> = ({ loan }) => {
  const loanStatus = determineLoanStatus(loan)

  const statusColor = LOAN_STATUS_COLOR_MAP[loanStatus as LoanStatus] || ''
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

  const mappedStatus = LOAN_STATUS_MAP[bondTradeTransactionState]

  if (mappedStatus !== LoanStatus.Active && isLoanExpired(loan)) {
    return LoanStatus.Liquidated
  }

  return mappedStatus
}
