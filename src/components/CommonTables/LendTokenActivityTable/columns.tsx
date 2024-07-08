import classNames from 'classnames'

import { ColumnType } from '@banx/components/Table'
import {
  DisplayValue,
  DurationCell,
  HeaderCell,
  NftInfoCell,
} from '@banx/components/TableComponents'

import { activity } from '@banx/api/tokens'

import { AprCell, StatusCell } from './cells'

import styles from './LendTokenActivityTable.module.less'

export const getTableColumns = () => {
  const columns: ColumnType<activity.LenderTokenActivity>[] = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collateral" align="left" />,
      render: ({ id, collateral }) => (
        <NftInfoCell key={id} nftName={collateral.ticker} nftImage={collateral.logoUrl} /> //TODO (TokenLending): Add new token cell
      ),
    },
    {
      key: 'lent',
      title: <HeaderCell label="Lent" />,
      render: (loan) => (
        <span className={classNames(styles.cellTitle, styles.lentCellTitle)}>
          <DisplayValue value={loan.lent} />
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
