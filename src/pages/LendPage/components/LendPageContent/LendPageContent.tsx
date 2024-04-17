import { useState } from 'react'

import { isEmpty } from 'lodash'

import { Loader } from '@banx/components/Loader'

import { useFakeInfinityScroll } from '@banx/hooks'
import { trackPageEvent } from '@banx/utils'

import FilterSection from '../FilterSection'
import LendCard from '../LendCard'
import { useLendPageContent } from './hooks'

import styles from './LendPageContent.module.less'

const LendPageContent = () => {
  const {
    marketsPreview,
    isLoading,
    searchSelectParams,
    sortParams,
    showEmptyList,
    onToggleHotFilter,
    isHotFilterActive,
    hotMarkets,
  } = useLendPageContent()

  const [visibleMarketPubkey, setMarketPubkey] = useState('')

  const onLendCardClick = (marketPubkey: string) => {
    trackPageEvent('lend', `collection`)

    const isSameMarketPubkey = visibleMarketPubkey === marketPubkey
    const nextValue = !isSameMarketPubkey ? marketPubkey : ''
    return setMarketPubkey(nextValue)
  }

  const { data: markets, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: marketsPreview })

  return (
    <div className={styles.content}>
      <FilterSection
        searchSelectParams={searchSelectParams}
        sortParams={sortParams}
        isHotFilterActive={isHotFilterActive}
        onToggleHotFilter={onToggleHotFilter}
        hotMarkets={hotMarkets}
      />
      {isLoading && isEmpty(marketsPreview) ? (
        <Loader />
      ) : (
        <div className={styles.marketsList}>
          {markets.map((market) => (
            <LendCard
              key={market.marketPubkey}
              market={market}
              onCardClick={() => onLendCardClick(market.marketPubkey)}
              isCardOpen={visibleMarketPubkey === market.marketPubkey}
            />
          ))}
          <div ref={fetchMoreTrigger} />
        </div>
      )}
      {showEmptyList && <EmptyList />}
    </div>
  )
}

export default LendPageContent

const EmptyList = () => (
  <div className={styles.emptyList}>
    <h4 className={styles.emptyListTitle}>No active markets yet</h4>
  </div>
)
