import classNames from 'classnames'

import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import FilterSection from '../FilterSection'
import OfferTokenCard from '../OfferTokenCard'
import Summary from '../Summary'
import { useOffersTokenContent } from './hooks'

import styles from './OffersTokenTabContent.module.less'

const OffersTokenTabContent = () => {
  const {
    offersPreview,
    rawOffers,
    updateOrAddOffer,
    isLoading,
    showEmptyList,
    searchSelectParams,
    sortParams,
    emptyListParams,
    visibleOfferPubkey,
    onCardClick,
  } = useOffersTokenContent()

  return (
    <div className={classNames(styles.content, { [styles.emptyContent]: showEmptyList })}>
      {showEmptyList && <EmptyList {...emptyListParams} />}

      {!showEmptyList && isLoading && <Loader size="small" />}

      {!showEmptyList && !isLoading && (
        <>
          <FilterSection searchSelectParams={searchSelectParams} sortParams={sortParams} />

          <div className={styles.offersList}>
            {offersPreview.map((offerPreview) => (
              <OfferTokenCard
                key={offerPreview.publicKey}
                offerPreview={offerPreview}
                onClick={() => onCardClick(offerPreview.publicKey)}
                isOpen={visibleOfferPubkey === offerPreview.publicKey}
              />
            ))}
          </div>
        </>
      )}

      <Summary offers={rawOffers} updateOrAddOffer={updateOrAddOffer} />
    </div>
  )
}

export default OffersTokenTabContent
