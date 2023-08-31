import { ColumnsType } from 'antd/es/table'

import {
  HeaderCell,
  NftInfoCell,
  createColumn,
  createPercentValueJSX,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { LenderActivity } from '@banx/api/core'
import { calculateTimeFromNow } from '@banx/utils'

import { APRCell } from './TableCells'

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
    },
    {
      key: 'interest',
      title: <HeaderCell label="Interest" />,
      render: (_, loan) => createSolValueJSX(loan.interest, 1e9),
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
      render: (_, loan) => <>{loan.status}</>,
    },
    {
      key: 'received',
      title: <HeaderCell label="Received" />,
      render: (_, loan) => createSolValueJSX(loan.received),
      sorter: true,
    },
    {
      key: 'When',
      title: <HeaderCell label="When" />,
      render: (_, loan) => calculateTimeFromNow(loan.timestamp),
      sorter: true,
    },
  ]

  return columns.map((column) => createColumn(column))
}
