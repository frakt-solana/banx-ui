import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import { useFakeInfinityScroll } from '@banx/hooks'

import BorrowCard from './components/BorrowCard'
import FilterSection from './components/FilterSection'
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

  if (showEmptyList) return <EmptyList message="You don't have any whitelisted collections" />

  return (
    <div className={styles.content}>
      <FilterSection searchSelectParams={searchSelectParams} sortParams={sortParams} />

      {isLoading && <Loader />}

      {!isLoading && (
        <div className={styles.marketsList}>
          {data.map((market) => (
            <BorrowCard
              key={market.marketPubkey.toBase58()}
              market={market}
              onClick={() => onCardClick(market.marketPubkey.toBase58())}
              isOpen={visibleMarketPubkey === market.marketPubkey.toBase58()}
            />
          ))}
          <div ref={fetchMoreTrigger} />
        </div>
      )}
    </div>
  )
}
