import { ColumnsType } from 'antd/es/table'

import {
  DurationCell,
  HeaderCell,
  NftInfoCell,
  createColumn,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { BorrowerActivity } from '@banx/api/activity'
import { formatDecimal } from '@banx/utils'

import { DebtCell, RepaidCell, StatusCell } from './TableCells'

export const getTableColumns = ({ isCardView }: { isCardView: boolean }) => {
  const columns: ColumnsType<BorrowerActivity> = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collection" />,
      render: (_, { nftName, nftImageUrl }) => (
        <NftInfoCell nftName={nftName} nftImage={nftImageUrl} />
      ),
    },
    {
      key: 'borrowed',
      title: <HeaderCell label="Borrowed" />,
      render: (_, { borrowed }) => createSolValueJSX(borrowed, 1e9, '--', formatDecimal),
      sorter: true,
    },
    {
      key: 'debt',
      title: <HeaderCell label="Debt" />,
      render: (_, loan) => <DebtCell loan={loan} isCardView={isCardView} />,
    },
    {
      key: 'status',
      title: <HeaderCell label="Loan status" />,
      render: (_, loan) => <StatusCell loan={loan} />,
    },
    {
      key: 'repaid',
      title: <HeaderCell label="Repaid by" />,
      render: (_, loan) => <RepaidCell loan={loan} />,
      sorter: true,
    },
    {
      key: 'timestamp',
      title: <HeaderCell label="When" />,
      render: (_, { publicKey, timestamp }) => (
        <DurationCell publicKey={publicKey} timestamp={timestamp} />
      ),
      sorter: true,
    },
  ]

  return columns.map((column) => createColumn(column))
}
