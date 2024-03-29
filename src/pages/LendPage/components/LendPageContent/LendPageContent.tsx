import { isEmpty } from 'lodash'

import { Loader } from '@banx/components/Loader'

import { useFakeInfinityScroll } from '@banx/hooks'
import { useMarketsURLControl } from '@banx/store'

import FilterSection from '../FilterSection'
import { EmptyList, MarketsList } from './components'
import { useLendPageContent } from './hooks'

import styles from './LendPageContent.module.less'

const LendPageContent = () => {
  const { visibleMarkets, toggleMarketVisibility } = useMarketsURLControl(true)
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
        <>
          <MarketsList
            markets={markets}
            visibleCards={visibleMarkets}
            toggleMarketVisibility={toggleMarketVisibility}
          />
          <div ref={fetchMoreTrigger} />
        </>
      )}
      {showEmptyList && <EmptyList />}
    </div>
  )
}

export default LendPageContent
