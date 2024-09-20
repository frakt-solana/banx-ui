import { FC } from 'react'

import { core } from '@banx/api/nft'

import { MarketCard } from '../../Card'

import styles from '../DashboardBorrowTab.module.less'

interface CardsListProps {
  marketsPreview: core.MarketPreview[]
}

const CardsList: FC<CardsListProps> = ({ marketsPreview }) => {
  return (
    <>
      <div className={styles.cardsList}>
        {marketsPreview.map((market) => (
          <MarketCard key={market.marketPubkey} market={market} onClick={() => null} />
        ))}
      </div>
    </>
  )
}

export default CardsList
