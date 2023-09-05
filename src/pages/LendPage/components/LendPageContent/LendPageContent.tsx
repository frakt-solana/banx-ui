import classNames from 'classnames'
import { isEmpty } from 'lodash'

import { Loader } from '@banx/components/Loader'

import { useMarketsURLControl } from '@banx/store'

import FilterSection from '../FilterSection'
import { EmptyList, MarketsList } from './components'
import { useLendPageContent } from './hooks'

import styles from './LendPageContent.module.less'

const LendPageContent = () => {
  const { visibleMarkets, toggleMarketVisibility } = useMarketsURLControl()
  const { marketsPreview, isLoading, searchSelectParams, sortParams, showEmptyList } =
    useLendPageContent()

  return (
    <div className={classNames(styles.content, { [styles.selected]: !!visibleMarkets?.length })}>
      <FilterSection searchSelectParams={searchSelectParams} sortParams={sortParams} />
      {isLoading && isEmpty(marketsPreview) ? (
        <Loader />
      ) : (
        <MarketsList
          markets={marketsPreview}
          visibleCards={visibleMarkets}
          toggleMarketVisibility={toggleMarketVisibility}
        />
      )}
      {showEmptyList && <EmptyList />}
    </div>
  )
}

export default LendPageContent
