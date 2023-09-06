import classNames from 'classnames'
import { isEmpty } from 'lodash'

import { Loader } from '@banx/components/Loader'

import { useMarketsURLControl } from '@banx/store'
import { useFakeInfinityScroll } from '@banx/hooks'

import FilterSection from '../FilterSection'
import { EmptyList, MarketsList } from './components'
import { useLendPageContent } from './hooks'

import styles from './LendPageContent.module.less'

const LendPageContent = () => {
  const { visibleMarkets, toggleMarketVisibility } = useMarketsURLControl()
  const { marketsPreview, isLoading, searchSelectParams, sortParams, showEmptyList } =
    useLendPageContent()

  const { data: markets, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: marketsPreview })

  return (
    <div className={classNames(styles.content, { [styles.selected]: !!visibleMarkets?.length })}>
      <FilterSection searchSelectParams={searchSelectParams} sortParams={sortParams} />
      {isLoading && isEmpty(marketsPreview) ? (
        <Loader />
      ) : (
        <>
          <MarketsList
            markets={markets}
            visibleCards={visibleCards}
            toggleVisibleCard={toggleVisibleCard}
          />
          <div ref={fetchMoreTrigger} />
        </>
      )}
      {showEmptyList && <EmptyList />}
    </div>
  )
}

export default LendPageContent
