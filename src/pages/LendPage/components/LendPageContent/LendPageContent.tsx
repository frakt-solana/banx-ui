import { isEmpty } from 'lodash'

import { Loader } from '@banx/components/Loader'

import { useVisibleMarketURLControl } from '@banx/store/useVisibleMarkets'

import { MarketsList } from './components'
import { useFilteredMarkets } from './hooks'

import styles from './LendPageContent.module.less'

const LendPageContent = () => {
  const { marketsPreview, isLoading } = useFilteredMarkets()
  const { visibleCards, toggleVisibleCard } = useVisibleMarketURLControl()

  return (
    <div className={styles.content}>
      {isLoading && isEmpty(marketsPreview) ? (
        <Loader />
      ) : (
        <MarketsList
          markets={marketsPreview}
          visibleCards={visibleCards}
          toggleVisibleCard={toggleVisibleCard}
        />
      )}
    </div>
  )
}

export default LendPageContent
