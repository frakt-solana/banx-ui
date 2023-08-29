import { FC } from 'react'

import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'

import Timer from '@banx/components/Timer'

import { Loan } from '@banx/api/core'
import { calculateTimeFromNow } from '@banx/utils'

import styles from '../LoansTable.module.less'

enum LoanStatus {
  Active = 'active',
  Terminating = 'terminating',
}

const STATUS_MAP: Record<string, string> = {
  [BondTradeTransactionV2State.PerpetualActive]: LoanStatus.Active,
  [BondTradeTransactionV2State.PerpetualManualTerminating]: LoanStatus.Terminating,
}

const STATUS_COLOR_MAP: Record<LoanStatus, string> = {
  [LoanStatus.Active]: 'var(--additional-green-primary-deep)',
  [LoanStatus.Terminating]: 'var(--additional-lava-primary-deep)',
}

export const StatusCell: FC<{ loan: Loan }> = ({ loan }) => {
  const { bondTradeTransaction } = loan

  const statusText = STATUS_MAP[bondTradeTransaction.bondTradeTransactionState] || ''
  const statusColor = STATUS_COLOR_MAP[statusText as LoanStatus] || ''

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
  const { bondTradeTransaction, fraktBond } = loan

  const currentTimeInSeconds = moment().unix()
  const timeSinceActivationInSeconds = currentTimeInSeconds - fraktBond.activatedAt

  if (status === LoanStatus.Active) {
    return calculateTimeFromNow(timeSinceActivationInSeconds)
  }

  if (status === LoanStatus.Terminating) {
    const expiredAt = bondTradeTransaction.redeemedAt + 24 * 60 * 60
    return <Timer expiredAt={expiredAt} detailedTimeFormat />
  }

  return ''
}
