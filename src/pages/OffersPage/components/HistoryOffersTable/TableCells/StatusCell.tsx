import { FC } from 'react'

import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'

import { LenderActivity } from '@banx/api/core'

import styles from '../HistoryOffersTable.module.less'

enum LoanStatus {
  Active = 'active',
  Repaid = 'repaid',
  Liquidated = 'liquidated',
  Terminating = 'terminating',
}

const STATUS_LOANS_MAP: Record<string, string> = {
  [BondTradeTransactionV2State.PerpetualActive]: LoanStatus.Active,
  [BondTradeTransactionV2State.PerpetualRepaid]: LoanStatus.Repaid,
  [BondTradeTransactionV2State.PerpetualLiquidatedByClaim]: LoanStatus.Liquidated,
  [BondTradeTransactionV2State.PerpetualManualTerminating]: LoanStatus.Terminating,
}

const STATUS_COLOR_MAP: Record<LoanStatus, string> = {
  [LoanStatus.Active]: 'var(--additional-green-primary-deep)',
  [LoanStatus.Repaid]: 'var(--additional-green-primary-deep)',
  [LoanStatus.Terminating]: 'var(--additional-lava-primary-deep)',
  [LoanStatus.Liquidated]: 'var(--additional-red-primary-deep)',
}

interface StatusCellProps {
  loan: LenderActivity
}

export const StatusCell: FC<StatusCellProps> = ({ loan }) => {
  const loanStatus = STATUS_LOANS_MAP[loan.status]
  const statusColor = STATUS_COLOR_MAP[loanStatus as LoanStatus]

  return (
    <span style={{ color: statusColor }} className={styles.statusCellTitle}>
      {loanStatus}
    </span>
  )
}
