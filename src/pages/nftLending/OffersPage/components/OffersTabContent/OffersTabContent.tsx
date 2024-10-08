import classNames from 'classnames'

import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import FilterSection from '../FilterSection'
import { HeaderList } from './components/HeaderList'
import OfferCard from './components/OfferCard'
import { useOffersContent } from './hooks'

import styles from './OffersTabContent.module.less'

const OffersTabContent = () => {
  const {
    offersToDisplay,
    isLoading,
    marketsPreview,
    visibleOfferPubkey,
    onCardClick,
    sortParams,
    searchSelectParams,
    emptyListParams,
    showEmptyList,
  } = useOffersContent()

  return (
    <div className={classNames(styles.content, { [styles.emptyContent]: showEmptyList })}>
      {showEmptyList && <EmptyList {...emptyListParams} />}

      {!showEmptyList && isLoading && <Loader size="small" />}

      {!showEmptyList && !isLoading && (
        <>
          <FilterSection searchSelectParams={searchSelectParams} sortParams={sortParams} />

          <HeaderList />

          <div className={styles.cardsList}>
            {offersToDisplay.map(({ offer }) => {
              const isOfferVisible = visibleOfferPubkey === offer.publicKey
              const currentMarket = marketsPreview.find(
                (market) => market.marketPubkey === offer.hadoMarket,
              )

              return (
                <OfferCard
                  key={offer.publicKey}
                  offer={offer}
                  market={currentMarket}
                  onToggleCard={() => onCardClick(offer.publicKey)}
                  isOpen={isOfferVisible}
                />
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default OffersTabContent
