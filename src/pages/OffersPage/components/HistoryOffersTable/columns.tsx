import { ColumnType } from '@banx/components/Table'
import {
  DurationCell,
  HeaderCell,
  HorizontalCell,
  NftInfoCell,
  createPercentValueJSX,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { LenderActivity } from '@banx/api/activity'
import { formatDecimal } from '@banx/utils'

import { ReceivedCell, StatusCell } from './TableCells'

export const getTableColumns = () => {
  const columns: ColumnType<LenderActivity>[] = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collateral" align="left" />,
      render: ({ nft }) => (
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
      render: (loan) => (
        <HorizontalCell
          value={createSolValueJSX(loan.currentRemainingLentAmount, 1e9, '--', formatDecimal)}
        />
      ),
      sorter: true,
    },
    {
      key: 'interest',
      title: <HeaderCell label="Interest" />,
      render: (loan) => (
        <HorizontalCell value={createSolValueJSX(loan.interest, 1e9, '--', formatDecimal)} />
      ),
      sorter: true,
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" />,
      render: (loan) => (
        <HorizontalCell value={createPercentValueJSX(loan.apr / 100)} isHighlighted />
      ),
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
