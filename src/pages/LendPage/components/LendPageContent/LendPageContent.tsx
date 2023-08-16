import classNames from 'classnames'
import { isEmpty } from 'lodash'

import { Loader } from '@banx/components/Loader'

import { useVisibleMarketURLControl } from '@banx/store/useVisibleMarkets'

import FilterSection from '../FilterSection'
import { EmptyList, MarketsList } from './components'
import { useLendPageContent } from './hooks'

import styles from './LendPageContent.module.less'

const LendPageContent = () => {
  const { visibleCards, toggleVisibleCard } = useVisibleMarketURLControl()
  const { marketsPreview, isLoading, searchSelectParams, sortParams, showEmptyList } =
    useLendPageContent()

  return (
    <div className={classNames(styles.content, { [styles.selected]: !!visibleCards?.length })}>
      <FilterSection searchSelectParams={searchSelectParams} sortParams={sortParams} />
      {isLoading && isEmpty(marketsPreview) ? (
        <Loader />
      ) : (
        <MarketsList
          markets={marketsPreview}
          visibleCards={visibleCards}
          toggleVisibleCard={toggleVisibleCard}
        />
      )}
      {showEmptyList && <EmptyList />}
    </div>
  )
}

export default LendPageContent
