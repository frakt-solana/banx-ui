import { FC } from 'react'

import { core } from '@banx/api/nft'

import { CollectionCard } from '../../Card'

import styles from '../DashboardBorrowTab.module.less'

interface CardsListProps {
  marketsPreview: core.MarketPreview[]
}

const CardsList: FC<CardsListProps> = ({ marketsPreview }) => {
  return (
    <>
      <div className={styles.cardsList}>
        {marketsPreview.map((market) => (
          <CollectionCard key={market.marketPubkey} market={market} />
        ))}
      </div>
    </>
  )
}

export default CardsList
