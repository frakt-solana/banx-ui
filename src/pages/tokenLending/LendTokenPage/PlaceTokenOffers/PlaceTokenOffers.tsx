import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import { useFakeInfinityScroll } from '@banx/hooks'

import FilterSection from './components/FilterSection'
import LendTokenCard from './components/LendTokenCard'
import { usePlaceTokenOffers } from './hooks'

import styles from './PlaceTokenOffers.module.less'

const PlaceTokenOffers = () => {
  const {
    marketsPreview,
    visibleMarketPubkey,
    onCardClick,
    searchSelectParams,
    sortParams,
    showEmptyList,
    isLoading,
  } = usePlaceTokenOffers()

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: marketsPreview })

  if (showEmptyList) return <EmptyList message="You don't have any whitelisted collections" />

  return (
    <div className={styles.content}>
      <FilterSection searchSelectParams={searchSelectParams} sortParams={sortParams} />

      {isLoading && <Loader />}

      {!isLoading && (
        <div className={styles.marketsList}>
          {data.map((market) => (
            <LendTokenCard
              key={market.marketPubkey}
              market={market}
              onClick={() => onCardClick(market.marketPubkey)}
              isOpen={visibleMarketPubkey === market.marketPubkey}
            />
          ))}
          <div ref={fetchMoreTrigger} />
        </div>
      )}
    </div>
  )
}

export default PlaceTokenOffers
