import { ColumnsType } from 'antd/es/table'

import { HeaderCell, NftInfoCell, createColumn } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'
import { calculateTimeFromNow } from '@banx/utils'

import { APRCell, InterestCell, LentCell, StatusCell } from './TableCells'

export const getTableColumns = () => {
  const columns: ColumnsType<Loan> = [
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
      render: (_, loan) => <LentCell loan={loan} />,
    },
    {
      key: 'interest',
      title: <HeaderCell label="Interest" />,
      render: (_, loan) => <InterestCell loan={loan} />,
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
      render: (_, loan) => <InterestCell loan={loan} />,
      sorter: true,
    },
    {
      key: 'When',
      title: <HeaderCell label="When" />,
      render: (_, loan) => calculateTimeFromNow(loan.fraktBond.activatedAt),
      sorter: true,
    },
  ]

  return columns.map((column) => createColumn(column))
}
