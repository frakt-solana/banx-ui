import { FC } from 'react'

import { MarketPreview } from '@banx/api/core'
import { trackPageEvent } from '@banx/utils'

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
  const onLendCardClick = (market: MarketPreview) => {
    toggleMarketVisibility(market.collectionName)
    trackPageEvent('lend', `collection`)
  }

  return (
    <div className={styles.marketsList}>
      {markets.map((market: MarketPreview) => {
        const { collectionName, marketPubkey } = market

        const isCardOpen = visibleCards.includes(collectionName)

        return (
          <LendCard
            key={marketPubkey}
            market={market}
            onCardClick={() => onLendCardClick(market)}
            isCardOpen={isCardOpen}
          />
        )
      })}
    </div>
  )
}
