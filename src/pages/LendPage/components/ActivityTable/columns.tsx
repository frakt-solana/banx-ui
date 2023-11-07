import {
  DurationCell,
  HeaderCell,
  NftInfoCell,
  createSolValueJSX,
} from '@banx/components/TableComponents'
import { ColumnType } from '@banx/components/TableVirtual'

import { LenderActivity } from '@banx/api/activity'

import { ReceivedCell, StatusCell } from './TableCells'

export const getTableColumns = () => {
  const columns: ColumnType<LenderActivity>[] = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collateral" />,
      render: (loan) => (
        <NftInfoCell nftName={loan.nft.meta.name} nftImage={loan.nft.meta.imageUrl} />
      ),
    },
    {
      key: 'lent',
      title: <HeaderCell label="Lent" />,
      render: (loan) => createSolValueJSX(loan.lent, 1e9),
      sorter: true,
    },
    {
      key: 'interest',
      title: <HeaderCell label="Interest" />,
      render: (loan) => createSolValueJSX(loan.interest, 1e9),
      sorter: true,
    },
    {
      key: 'status',
      title: (
        <HeaderCell
          label="Loan status"
          tooltipText="Current status and duration of the loan that has been passed"
        />
      ),
      render: (loan) => <StatusCell loan={loan} />,
    },
    {
      key: 'received',
      title: <HeaderCell label="Received" />,
      render: (loan) => <ReceivedCell loan={loan} />,
      sorter: true,
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
