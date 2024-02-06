import { ColumnType } from '@banx/components/Table'
import {
  DurationCell,
  HeaderCell,
  NftInfoCell,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { LenderActivity } from '@banx/api/activity'
import { formatDecimal } from '@banx/utils'

import { APRCell, ReceivedCell, StatusCell } from './TableCells'

export const getTableColumns = () => {
  const columns: ColumnType<LenderActivity>[] = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collateral" align="left" />,
      render: ({ id, nft }) => (
        <NftInfoCell
          key={id}
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
      render: (loan) =>
        createSolValueJSX(loan.currentRemainingLentAmount, 1e9, '--', formatDecimal),
      sorter: true,
    },
    {
      key: 'interest',
      title: <HeaderCell label="Interest" />,
      render: (loan) => createSolValueJSX(loan.interest, 1e9, '--', formatDecimal),
      sorter: true,
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" />,
      render: (loan) => <APRCell loan={loan} />,
      sorter: true,
    },
    {
      key: 'status',
      title: <HeaderCell label="Status" />,
      render: (loan) => <StatusCell loan={loan} />,
    },
    {
      key: 'received',
      title: <HeaderCell label="Received" />,
      render: (loan) => <ReceivedCell loan={loan} />,
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
