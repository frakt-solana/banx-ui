import { ColumnType } from '@banx/components/Table'
import {
  DisplayValue,
  DurationCell,
  HeaderCell,
  HorizontalCell,
  NftInfoCell,
  createPercentValueJSX,
} from '@banx/components/TableComponents'

import { activity } from '@banx/api/tokens'

import { ReceivedCell, StatusCell } from './cells'

export const getTableColumns = () => {
  const columns: ColumnType<activity.LenderTokenActivity>[] = [
    {
      key: 'collateral',
      title: <HeaderCell label="Collateral" align="left" />,
      render: ({ id, collateral }) => (
        <NftInfoCell key={id} nftName={collateral.ticker} nftImage={collateral.logoUrl} />
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
