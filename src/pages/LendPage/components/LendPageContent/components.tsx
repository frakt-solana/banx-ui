import { FC } from 'react'

import { Button } from '@banx/components/Buttons'

import { MarketPreview } from '@banx/api/bonds'
import { TABLET_WIDTH } from '@banx/constants'
import { useWindowSize } from '@banx/hooks'

import LendCard from '../LendCard'

import styles from './LendPageContent.module.less'

export const EmptyList = ({ onClick }: { onClick: () => void }) => (
  <div className={styles.emptyList}>
    <h4 className={styles.emptyListTitle}>You don’t have any deposits</h4>
    <Button type="standard" onClick={onClick} className={styles.emptyListButton}>
      View collections
    </Button>
  </div>
)

interface MarketsListProps {
  markets: MarketPreview[]
  visibleCards: string[]
  toggleVisibleCard: (collectionName: string) => void
}

export const MarketsList: FC<MarketsListProps> = ({ markets, visibleCards, toggleVisibleCard }) => {
  const { width } = useWindowSize()
  const isMobile = width < TABLET_WIDTH

  return (
    <>
      {markets.map((market: MarketPreview, id: number) => {
        const { collectionName, marketPubkey } = market

        const cardIsOpen = visibleCards.includes(collectionName)

        const shouldVisibleOrderBook = isMobile
          ? visibleCards.at(-1) === collectionName
          : cardIsOpen

        return (
          <LendCard
            key={`${marketPubkey}_${id}`}
            market={market}
            onCardClick={() => toggleVisibleCard(collectionName)}
            visibleOrderBook={shouldVisibleOrderBook}
            isVisible={cardIsOpen}
          />
        )
      })}
    </>
  )
}
