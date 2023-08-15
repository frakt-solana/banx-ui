import { FC } from 'react'

import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'

import Timer from '@banx/components/Timer'

import { Loan } from '@banx/api/loans'

import styles from '../LoansTable.module.less'

enum LoanStatus {
  Active = 'active',
  Terminating = 'terminating',
}

export const StatusCell: FC<{ loan: Loan }> = ({ loan }) => {
  const { bondTradeTransaction } = loan

  const statusText = statusMap[bondTradeTransaction.bondTradeTransactionState] || ''
  const statusColor = statusColorMap[statusText] || ''

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
    return formatTimeDuration(timeSinceActivationInSeconds)
  }

  if (status === LoanStatus.Terminating) {
    const expiredAt = bondTradeTransaction.redeemedAt + 24 * 60 * 60
    return <Timer expiredAt={expiredAt} detailedTimeFormat />
  }

  return ''
}

const statusMap: Record<string, string> = {
  [BondTradeTransactionV2State.PerpetualActive]: LoanStatus.Active,
  [BondTradeTransactionV2State.PerpetualManualTerminating]: LoanStatus.Terminating,
}

const statusColorMap: Record<string, string> = {
  active: 'var(--additional-green-primary-deep)',
  terminating: 'var(--additional-lava-primary-deep',
}

const formatTimeDuration = (seconds: number) => {
  return moment.unix(moment().unix() + seconds).toNow(true)
}
