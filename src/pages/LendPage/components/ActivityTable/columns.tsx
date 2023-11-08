import { ColumnsType } from 'antd/es/table'

import {
  DurationCell,
  HeaderCell,
  NftInfoCell,
  createColumn,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { LenderActivity } from '@banx/api/activity'

import { ReceivedCell, StatusCell } from './TableCells'

export const getTableColumns = () => {
  const columns: ColumnsType<LenderActivity> = [
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
      key: 'status',
      title: (
        <HeaderCell
          label="Loan status"
          tooltipText="Current status and duration of the loan that has been passed"
        />
      ),
      render: (_, loan) => <StatusCell loan={loan} />,
    },
    {
      key: 'received',
      title: <HeaderCell label="Received" />,
      render: (_, loan) => <ReceivedCell loan={loan} />,
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
