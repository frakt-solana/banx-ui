import { ColumnType } from '@banx/components/Table'
import {
  DisplayValue,
  HeaderCell,
  HorizontalCell,
  NftInfoCell,
} from '@banx/components/TableComponents'

import { core } from '@banx/api/nft'

export const getTableColumns = () => {
  const columns: ColumnType<core.MarketPreview>[] = [
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
      render: ({ collectionFloor }) => (
        <HorizontalCell value={<DisplayValue value={collectionFloor} placeholder="--" />} />
      ),
    },

    {
      key: 'borrow',
      title: <HeaderCell label="Borrow up to" />,
      render: ({ bestOffer }) => (
        <HorizontalCell value={<DisplayValue value={bestOffer} placeholder="--" />} />
      ),
    },
    {
      key: 'liquidity',
      title: <HeaderCell label="Liquidity" />,
      render: ({ offerTvl }) => (
        <HorizontalCell
          value={<DisplayValue value={offerTvl} placeholder="--" />}
          isHighlighted={!!offerTvl}
        />
      ),
    },
  ]

  return columns
}
