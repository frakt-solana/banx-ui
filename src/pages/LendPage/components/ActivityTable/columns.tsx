import { ColumnType } from '@banx/components/Table'
import { DurationCell, HeaderCell } from '@banx/components/TableComponents'

import { LenderActivity } from '@banx/api/activity'

import { AprCell, CollateralCell, LentCell, StatusCell } from './cells'

export const getTableColumns = () => {
  const columns: ColumnType<LenderActivity>[] = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collateral" align="left" />,
      render: ({ nft }) => <CollateralCell nft={nft} />,
    },
    {
      key: 'lent',
      title: <HeaderCell label="Lent" />,
      render: (loan) => <LentCell loan={loan} />,
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
        <DurationCell publicKey={publicKey} timestamp={timestamp} />
      ),
      sorter: true,
    },
  ]

  return columns
}
