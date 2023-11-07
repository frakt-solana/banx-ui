import { ColumnType } from '@banx/components/Table'
import { HeaderCell, NftInfoCell, createSolValueJSX } from '@banx/components/TableComponents'

import { MarketPreview } from '@banx/api/core'
import { DAYS_IN_YEAR } from '@banx/constants'

import styles from './NotConnectedTable.module.less'

export const getTableColumns = () => {
  const columns: ColumnType<MarketPreview>[] = [
    {
      key: 'collection',
      title: <HeaderCell label="Collection" />,
      render: (market) => (
        <NftInfoCell nftName={market.collectionName} nftImage={market.collectionImage} />
      ),
    },
    {
      key: 'floorPrice',
      title: <HeaderCell label="Floor" />,
      render: (market) => createSolValueJSX(market.collectionFloor, 1e9),
      sorter: true,
    },

    {
      key: 'borrow',
      title: <HeaderCell label="Borrow" />,
      render: (market) => createSolValueJSX(market.bestOffer, 1e9),
      sorter: true,
    },
    {
      key: 'fee',
      title: <HeaderCell label="Daily fee" tooltipText="Daily fee" />,
      render: ({ marketApr, collectionFloor }) =>
        createSolValueJSX((marketApr / 1e4 / DAYS_IN_YEAR) * collectionFloor, 1e9),
    },
    {
      key: 'liquidity',
      title: <HeaderCell label="Liquidity" />,
      render: ({ offerTvl }) => (
        <span className={offerTvl ? styles.liquidityCell : ''}>
          {createSolValueJSX(offerTvl, 1e9)}
        </span>
      ),
      sorter: true,
    },
  ]

  return columns
}
