import { ColumnsType } from 'antd/es/table'

import {
  HeaderCell,
  NftInfoCell,
  createColumn,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { MarketPreview } from '@banx/api/core'

export const getTableColumns = () => {
  const columns: ColumnsType<MarketPreview> = [
    {
      key: 'collection',
      title: <HeaderCell label="Collection" />,
      render: (_, market) => (
        <NftInfoCell nftName={market.collectionName} nftImage={market.collectionImage} />
      ),
    },
    {
      key: 'floorPrice',
      title: <HeaderCell label="Floor" />,
      render: (_, market) => createSolValueJSX(market.collectionFloor, 1e9),
      sorter: true,
    },
    {
      key: 'borrow',
      title: <HeaderCell label="Borrow" />,
      render: (_, market) => createSolValueJSX(market.bestOffer, 1e9),
      sorter: true,
    },
    {
      key: 'fee',
      title: <HeaderCell label="Fee" />,
      render: (_, market) => createSolValueJSX(market.collectionFloor, 1e9),
      sorter: true,
    },
    {
      key: 'liquidity',
      title: <HeaderCell label="Liquidity" />,
      render: (_, market) => createSolValueJSX(market.offerTVL, 1e9),
      sorter: true,
    },
  ]

  return columns.map((column) => createColumn(column))
}
