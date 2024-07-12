import { FC } from 'react'

import { BondTradeTransactionV2State } from 'fbonds-core/lib/fbond-protocol/types'
import { capitalize } from 'lodash'

import { DisplayValue, HorizontalCell } from '@banx/components/TableComponents'

import { activity } from '@banx/api/tokens'
import {
  LoanStatus,
  STATUS_LOANS_COLOR_MAP,
  STATUS_LOANS_MAP_WITH_REFINANCED_ACTIVE,
} from '@banx/utils'

import styles from './LenderTokenActivityTable.module.less'

export const ReceivedCell: FC<{ loan: activity.LenderTokenActivity }> = ({ loan }) => {
  const { received, status } = loan

  if (status === BondTradeTransactionV2State.PerpetualLiquidatedByClaim) {
    return <HorizontalCell value="Collateral" />
  }

  return <HorizontalCell value={<DisplayValue value={received} placeholder="--" />} />
}

export const StatusCell: FC<{ loan: activity.LenderTokenActivity }> = ({ loan }) => {
  const loanStatus = STATUS_LOANS_MAP_WITH_REFINANCED_ACTIVE[loan.status]
  const statusColor = STATUS_LOANS_COLOR_MAP[loanStatus as LoanStatus]

  return (
    <span style={{ color: statusColor }} className={styles.statusCellTitle}>
      {capitalize(loanStatus)}
    </span>
  )
}
