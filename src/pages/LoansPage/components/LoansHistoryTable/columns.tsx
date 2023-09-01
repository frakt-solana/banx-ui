import { ColumnsType } from 'antd/es/table'

import {
  HeaderCell,
  NftInfoCell,
  createColumn,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { BorrowerActivity } from '@banx/api/core'

import { DebtCell, RepaidCell, StatusCell } from './TableCells'

export const getTableColumns = () => {
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
      render: (_, { borrowed }) => createSolValueJSX(borrowed, 1e9),
      sorter: true,
    },
    {
      key: 'debt',
      title: <HeaderCell label="Debt" />,
      render: (_, loan) => <DebtCell loan={loan} />,
      sorter: true,
    },
    {
      key: 'status',
      title: <HeaderCell label="Loan status" />,
      render: (_, loan) => <StatusCell loan={loan} />,
    },
    {
      key: 'repaidBy',
      title: <HeaderCell label="Repaid by" />,
      render: (_, loan) => <RepaidCell loan={loan} />,
      sorter: true,
    },
  ]

  return columns.map((column) => createColumn(column))
}
