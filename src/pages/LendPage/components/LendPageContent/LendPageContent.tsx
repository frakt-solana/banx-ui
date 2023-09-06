import classNames from 'classnames'
import { isEmpty } from 'lodash'

import { Loader } from '@banx/components/Loader'

import { useFakeInfinityScroll } from '@banx/hooks'
import { useVisibleMarketURLControl } from '@banx/store/useVisibleMarkets'

import FilterSection from '../FilterSection'
import { EmptyList, MarketsList } from './components'
import { useLendPageContent } from './hooks'

import styles from './LendPageContent.module.less'

const LendPageContent = () => {
  const { visibleCards, toggleVisibleCard } = useVisibleMarketURLControl()
  const { marketsPreview, isLoading, searchSelectParams, sortParams, showEmptyList } =
    useLendPageContent()

  const { data: markets, fetchMoreTrigger } = useFakeInfinityScroll({ rawData: marketsPreview })

  return (
    <div className={classNames(styles.content, { [styles.selected]: !!visibleCards?.length })}>
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
