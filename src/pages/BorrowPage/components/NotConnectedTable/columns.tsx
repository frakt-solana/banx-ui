import { ColumnType } from '@banx/components/Table'
import {
  HeaderCell,
  HorizontalCell,
  NftInfoCell,
  createSolValueJSX,
} from '@banx/components/TableComponents'

import { MarketPreview } from '@banx/api/core'
import { formatDecimal } from '@banx/utils'

export const getTableColumns = () => {
  const columns: ColumnType<MarketPreview>[] = [
    {
      key: 'collection',
      title: <HeaderCell label="Collection" align="left" />,
      render: (market) => (
        <NftInfoCell
          key={market.marketPubkey}
          nftName={market.collectionName}
          nftImage={market.collectionImage}
        />
      ),
    },
    {
      key: 'floorPrice',
      title: <HeaderCell label="Floor" />,
      render: (market) => (
        <HorizontalCell
          value={createSolValueJSX(market.collectionFloor, 1e9, '--', formatDecimal)}
        />
      ),
    },

    {
      key: 'borrow',
      title: <HeaderCell label="Borrow up to" />,
      render: (market) => (
        <HorizontalCell value={createSolValueJSX(market.bestOffer, 1e9, '--', formatDecimal)} />
      ),
    },
    {
      key: 'liquidity',
      title: <HeaderCell label="Liquidity" />,
      render: ({ offerTvl }) => (
        <HorizontalCell
          value={createSolValueJSX(offerTvl, 1e9, '--', formatDecimal)}
          isHighlighted={!!offerTvl}
        />
      ),
    },
  ]

  return columns
}
