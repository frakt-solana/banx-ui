import { FC } from 'react'

import { core } from '@banx/api/nft'

import { CollectionCard } from '../../Card'

import styles from '../DashboardLendTab.module.less'

interface CollectionsCardListProps {
  marketsPreview: core.MarketPreview[]
}

const CollectionsCardList: FC<CollectionsCardListProps> = ({ marketsPreview }) => {
  return (
    <div className={styles.collectionsCardList}>
      {marketsPreview.map((market) => (
        <CollectionCard key={market.marketPubkey} market={market} />
      ))}
    </div>
  )
}
export default CollectionsCardList
