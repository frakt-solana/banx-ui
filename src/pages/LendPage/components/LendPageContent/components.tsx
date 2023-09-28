import { FC } from 'react'

import { MarketPreview } from '@banx/api/core'
import { TABLET_WIDTH } from '@banx/constants'
import { useWindowSize } from '@banx/hooks'

import LendCard from '../LendCard'

import styles from './LendPageContent.module.less'

export const EmptyList = () => (
  <div className={styles.emptyList}>
    <h4 className={styles.emptyListTitle}>No active markets yet</h4>
  </div>
)

interface MarketsListProps {
  markets: MarketPreview[]
  visibleCards: string[]
  toggleMarketVisibility: (collectionName: string) => void
}

export const MarketsList: FC<MarketsListProps> = ({
  markets,
  visibleCards,
  toggleMarketVisibility,
}) => {
  const { width } = useWindowSize()
  const isMobile = width < TABLET_WIDTH

  return (
    <div className={styles.marketsList}>
      {markets.map((market: MarketPreview) => {
        const { collectionName, marketPubkey } = market

        const isCardOpen = visibleCards.includes(collectionName)
        const isOrderBookVisible = isMobile ? visibleCards.at(-1) === collectionName : isCardOpen

        return (
          <LendCard
            key={marketPubkey}
            market={market}
            onCardClick={() => toggleMarketVisibility(collectionName)}
            isOrderBookVisible={isOrderBookVisible}
            isCardOpen={isCardOpen}
          />
        )
      })}
    </div>
  )
}
