import { ColumnType } from '@banx/components/Table'
import {
  DisplayValue,
  DurationCell,
  HeaderCell,
  HorizontalCell,
  NftInfoCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'

import { LenderActivity } from '@banx/api/activity'

import { ReceivedCell, StatusCell } from './TableCells'

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
      render: (loan) => (
        <HorizontalCell
          value={<DisplayValue value={loan.currentRemainingLentAmount} placeholder="--" />}
        />
      ),
    },
    {
      key: 'interest',
      title: <HeaderCell label="Interest" />,
      render: (loan) => (
        <HorizontalCell value={<DisplayValue value={loan.interest} placeholder="--" />} />
      ),
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" />,
      render: (loan) => (
        <HorizontalCell value={createPercentValueJSX(loan.apr / 100)} isHighlighted />
      ),
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
    },
    {
      key: 'timestamp',
      title: <HeaderCell label="When" />,
      render: ({ publicKey, timestamp }) => (
        <DurationCell publicKey={publicKey} timestamp={timestamp} />
      ),
    },
  ]

  return columns
}
