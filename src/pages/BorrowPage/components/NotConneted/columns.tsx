import { ColumnsType } from 'antd/es/table'

import {
  HeaderCell,
  NftInfoCell,
  createColumn,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { MarketPreview } from '@banx/api/core'

import styles from './NotConnected.module.less'

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
      key: 'liquidity',
      title: <HeaderCell label="Liquidity" />,
      render: (_, { offerTVL }) => (
        <span className={offerTVL ? styles.liquidityCell : ''}>
          {createSolValueJSX(offerTVL, 1e9)}
        </span>
      ),
      sorter: true,
    },
  ]

  return columns.map((column) => createColumn(column))
}
