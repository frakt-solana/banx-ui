import { ColumnType } from '@banx/components/Table'
import {
  DisplayValue,
  DurationCell,
  HeaderCell,
  HorizontalCell,
  NftInfoCell,
} from '@banx/components/TableComponents'

import { BorrowerActivity } from '@banx/api/activity'

import { DebtCell, RepaidCell, StatusCell } from './TableCells'

export const getTableColumns = ({ isCardView }: { isCardView: boolean }) => {
  const columns: ColumnType<BorrowerActivity>[] = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collection" align="left" />,
      render: ({ nftName, nftImageUrl, nft, id }) => (
        <NftInfoCell
          key={id}
          nftName={nftName}
          nftImage={nftImageUrl}
          banxPoints={{
            partnerPoints: nft.meta.partnerPoints || 0,
            playerPoints: nft.meta.playerPoints || 0,
          }}
        />
      ),
    },
    {
      key: 'borrowed',
      title: <HeaderCell label="Borrowed" />,
      render: ({ borrowed }) => (
        <HorizontalCell value={<DisplayValue value={borrowed} placeholder="--" />} />
      ),
    },
    {
      key: 'debt',
      title: <HeaderCell label="Debt" />,
      render: (loan) => <DebtCell loan={loan} isCardView={isCardView} />,
    },
    {
      key: 'status',
      title: <HeaderCell label="Status" />,
      render: (loan) => <StatusCell loan={loan} />,
    },
    {
      key: 'repaid',
      title: <HeaderCell label="Repaid by" />,
      render: (loan) => <RepaidCell loan={loan} />,
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
