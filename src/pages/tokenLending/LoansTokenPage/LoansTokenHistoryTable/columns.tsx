import { ColumnType } from '@banx/components/Table'
import {
  DisplayValue,
  DurationCell,
  HeaderCell,
  HorizontalCell,
  NftInfoCell,
} from '@banx/components/TableComponents'

import { activity } from '@banx/api/tokens'

import { DebtCell, RepaidCell, StatusCell } from './cells'

export const getTableColumns = ({ isCardView }: { isCardView: boolean }) => {
  const columns: ColumnType<activity.TokenBorrowerActivity>[] = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collection" align="left" />,
      render: ({ id, collateral }) => (
        <NftInfoCell key={id} nftName={collateral.ticker} nftImage={collateral.logoUrl} /> //TODO (TokenLending): Add new token cell
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
