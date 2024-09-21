import classNames from 'classnames'

import { ColumnType } from '@banx/components/Table'
import {
  CollateralTokenCell,
  DisplayValue,
  DurationCell,
  HeaderCell,
} from '@banx/components/TableComponents'

import { activity } from '@banx/api/tokens'
import { formatCollateralTokenValue } from '@banx/utils'

import { AprCell, StatusCell } from './cells'

import styles from './LendTokenActivityTable.module.less'

export const getTableColumns = () => {
  const columns: ColumnType<activity.LenderTokenActivity>[] = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collateral" align="left" />,
      render: ({ id, collateral, tokenSupply }) => (
        <CollateralTokenCell
          key={id}
          collateralImageUrl={collateral.logoUrl}
          collateralTokenAmount={formatCollateralTokenValue(
            tokenSupply / Math.pow(10, collateral.decimals),
          )}
          className={styles.collateralTokenCell}
        />
      ),
    },
    {
      key: 'lent',
      title: <HeaderCell label="Lent" />,
      render: (loan) => (
        <span className={classNames(styles.cellTitle, styles.lentCellTitle)}>
          <DisplayValue value={loan.currentRemainingLentAmount} />
        </span>
      ),
    },
    {
      key: 'apr',
      title: <HeaderCell label="Apr" />,
      render: (loan) => <AprCell loan={loan} />,
    },
    {
      key: 'status',
      title: (
        <HeaderCell
          label="Status"
          tooltipText="Current status and duration of the loan that has been passed"
        />
      ),
      render: (loan) => <StatusCell loan={loan} />,
    },
    {
      key: 'timestamp',
      title: <HeaderCell label="When" />,
      render: ({ publicKey, timestamp }) => (
        <DurationCell className={styles.cellTitle} publicKey={publicKey} timestamp={timestamp} />
      ),
    },
  ]

  return columns
}
