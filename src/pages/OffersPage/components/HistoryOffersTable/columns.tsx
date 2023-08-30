import { ColumnsType } from 'antd/es/table'

import { HeaderCell, NftInfoCell, createColumn } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'

import { APRCell, InterestCell, LentCell, StatusCell } from './TableCells'

interface GetTableColumns {
  isCardView: boolean
}

export const getTableColumns = ({ isCardView }: GetTableColumns) => {
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
      sorter: true,
    },
    {
      key: 'interest',
      title: <HeaderCell label="Interest" />,
      render: (_, loan) => <InterestCell loan={loan} />,
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
      sorter: true,
    },
  ]

  return columns.map((column) => createColumn(column))
}
