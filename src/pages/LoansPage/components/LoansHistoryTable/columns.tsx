import { ColumnType } from '@banx/components/Table'
import {
  DurationCell,
  HeaderCell,
  NftInfoCell,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { BorrowerActivity } from '@banx/api/activity'
import { formatDecimal } from '@banx/utils'

import { DebtCell, RepaidCell, StatusCell } from './TableCells'

export const getTableColumns = ({ isCardView }: { isCardView: boolean }) => {
  const columns: ColumnType<BorrowerActivity>[] = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collection" align="left" />,
      render: ({ nftName, nftImageUrl }) => (
        <NftInfoCell nftName={nftName} nftImage={nftImageUrl} />
      ),
    },
    {
      key: 'borrowed',
      title: <HeaderCell label="Borrowed" />,
      render: ({ borrowed }) => createSolValueJSX(borrowed, 1e9, '--', formatDecimal),
      sorter: true,
    },
    {
      key: 'debt',
      title: <HeaderCell label="Debt" />,
      render: (loan) => <DebtCell loan={loan} isCardView={isCardView} />,
    },
    {
      key: 'status',
      title: <HeaderCell label="Loan status" />,
      render: (loan) => <StatusCell loan={loan} />,
    },
    {
      key: 'repaid',
      title: <HeaderCell label="Repaid by" />,
      render: (loan) => <RepaidCell loan={loan} />,
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
