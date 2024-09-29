import { useState } from 'react'

import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import { useFakeInfinityScroll } from '@banx/hooks'

import FilterSection from './components/FilterSection'
import { HeaderList } from './components/HeaderList'
import LendCard from './components/LendCard'
import { useLendPageContent } from './hooks'

import styles from './PlaceOffersContent.module.less'

const PlaceOfferContent = () => {
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

      <HeaderList />

      {showEmptyList && <EmptyList message="No active markets yet" />}

      {isLoading && <Loader />}

      {!isLoading && (
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
    </div>
  )
}

export default PlaceOfferContent
