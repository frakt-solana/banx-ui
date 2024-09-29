import classNames from 'classnames'

import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import FilterSection from '../FilterSection'
import OfferCard from './components/OfferCard'
import Summary from './components/Summary'
import { useOffersContent } from './hooks'

import styles from './OffersTabContent.module.less'

const OffersTabContent = () => {
  const {
    offers,
    offersToDisplay,
    updateOrAddOffer,
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

      <Summary updateOrAddOffer={updateOrAddOffer} offers={offers} />
    </div>
  )
}

export default OffersTabContent
