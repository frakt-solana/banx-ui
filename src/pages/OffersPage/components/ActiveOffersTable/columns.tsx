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
      render: (_, { nft }) => (
        <NftInfoCell
          nftName={nft.meta.name}
          nftImage={nft.meta.imageUrl}
          banxPoints={{
            partnerPoints: nft.meta.partnerPoints || 0,
            playerPoints: nft.meta.playerPoints || 0,
          }}
        />
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
      title: (
        <HeaderCell
          label="Total claim"
          tooltipText="Sum of lent amount and accrued interest to date"
        />
      ),
      render: (_, loan) => <InterestCell loan={loan} isCardView={isCardView} />,
    },
    {
      key: 'apy',
      title: <HeaderCell label="APY" />,
      render: (_, loan) => <APRCell loan={loan} />,
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
