import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import { useFakeInfinityScroll } from '@banx/hooks'

import BorrowCard from './components/BorrowCard'
import FilterSection from './components/FilterSection'
import { HeaderList } from './components/HeaderList'
import { useRequestLoansContent } from './hooks'

import styles from './RequestLoansContent.module.less'

export const RequestLoansContent = () => {
  const {
    visibleMarketPubkey,
    searchSelectParams,
    sortParams,
    isLoading,
    onCardClick,
    markets,
    showEmptyList,
  } = useRequestLoansContent()

  const { data, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: markets })

  return (
    <div className={styles.content}>
      <FilterSection searchSelectParams={searchSelectParams} sortParams={sortParams} />

      <HeaderList />

      {showEmptyList && <EmptyList message="You don't have any whitelisted collections" />}

      {isLoading && <Loader />}

      {!isLoading && (
        <div className={styles.marketsList}>
          {data.map((market) => (
            <BorrowCard
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
