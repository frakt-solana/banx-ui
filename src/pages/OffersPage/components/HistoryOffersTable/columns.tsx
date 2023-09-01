import { ColumnsType } from 'antd/es/table'

import {
  HeaderCell,
  NftInfoCell,
  createColumn,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { LenderActivity } from '@banx/api/core'

import { APRCell, DurationCell, ReceivedCell, StatusCell } from './TableCells'

export const getTableColumns = () => {
  const columns: ColumnsType<LenderActivity> = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collateral" />,
      render: (_, loan) => (
        <NftInfoCell nftName={loan.nft.meta.name} nftImage={loan.nft.meta.imageUrl} />
      ),
    },
    {
      key: 'lent',
      title: <HeaderCell label="Lent" />,
      render: (_, loan) => createSolValueJSX(loan.lent, 1e9),
      sorter: true,
    },
    {
      key: 'interest',
      title: <HeaderCell label="Interest" />,
      render: (_, loan) => createSolValueJSX(loan.interest, 1e9),
      sorter: true,
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" />,
      render: (_, loan) => <APRCell loan={loan} />,
      sorter: true,
    },
    {
      key: 'status',
      title: <HeaderCell label="Loan status" tooltipText="Loan status" />,
      render: (_, loan) => <StatusCell loan={loan} />,
    },
    {
      key: 'received',
      title: <HeaderCell label="Received" />,
      render: (_, loan) => <ReceivedCell loan={loan} />,
      sorter: true,
    },
    {
      key: 'duration',
      title: <HeaderCell label="When" />,
      render: (_, loan) => <DurationCell loan={loan} />,
      sorter: true,
    },
  ]

  return columns.map((column) => createColumn(column))
}
