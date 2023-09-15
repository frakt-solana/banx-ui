import { ColumnsType } from 'antd/es/table'

import { HeaderCell, NftInfoCell, createColumn } from '@banx/components/TableComponents'

import { Loan } from '@banx/api/core'

import { APRCell, ActionsCell, InterestCell, LentCell, StatusCell } from './TableCells'

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
      render: (_, loan) => <LentCell loan={loan} isCardView={isCardView} />,
      sorter: true,
    },
    {
      key: 'interest',
      title: <HeaderCell label="CRT. Interest" tooltipText="CRT. Interest" />,
      render: (_, loan) => <InterestCell loan={loan} />,
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" tooltipText="APR" />,
      render: (_, loan) => <APRCell loan={loan} />,
      sorter: true,
    },
    {
      key: 'status',
      title: <HeaderCell label="Loan status" tooltipText="Loan status" />,
      render: (_, loan) => <StatusCell loan={loan} isCardView={isCardView} />,
      sorter: true,
    },
    {
      title: <HeaderCell label="Termination" />,
      render: (_, loan) => <ActionsCell loan={loan} isCardView={isCardView} />,
    },
  ]

  return columns.map((column) => createColumn(column))
}
