import { ColumnType } from '@banx/components/Table'
import {
  DisplayValue,
  HeaderCell,
  HorizontalCell,
  NftInfoCell,
} from '@banx/components/TableComponents'

import { coreNew } from '@banx/api/nft'

export const getTableColumns = () => {
  const columns: ColumnType<coreNew.MarketPreview>[] = [
    {
      key: 'collection',
      title: <HeaderCell label="Collection" align="left" />,
      render: (market) => (
        <NftInfoCell
          key={market.marketPubkey.toBase58()}
          nftName={market.collectionName}
          nftImage={market.collectionImage}
        />
      ),
    },
    {
      key: 'floorPrice',
      title: <HeaderCell label="Floor" />,
      render: ({ collectionFloor }) => (
        <HorizontalCell
          value={<DisplayValue value={collectionFloor.toNumber()} placeholder="--" />}
        />
      ),
    },

    {
      key: 'borrow',
      title: <HeaderCell label="Borrow up to" />,
      render: ({ bestOffer }) => (
        <HorizontalCell value={<DisplayValue value={bestOffer.toNumber()} placeholder="--" />} />
      ),
    },
    {
      key: 'liquidity',
      title: <HeaderCell label="Liquidity" />,
      render: ({ offerTvl }) => (
        <HorizontalCell
          value={<DisplayValue value={offerTvl.toNumber()} placeholder="--" />}
          isHighlighted={!!offerTvl}
        />
      ),
    },
  ]

  return columns
}
