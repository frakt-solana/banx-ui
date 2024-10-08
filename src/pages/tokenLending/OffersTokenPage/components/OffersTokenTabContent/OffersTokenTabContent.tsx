import classNames from 'classnames'

import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import FilterSection from '../FilterSection'
import OfferTokenCard from '../OfferTokenCard'
import TokensListHeader from '../TokensListHeader'
import { useOffersTokenContent } from './hooks'

import styles from './OffersTokenTabContent.module.less'

const OffersTokenTabContent = () => {
  const {
    offersToDisplay,
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

          <TokensListHeader />

          <div className={styles.offersList}>
            {offersToDisplay.map((offerPreview) => (
              <OfferTokenCard
                key={offerPreview.publicKey}
                offerPreview={offerPreview}
                onToggleCard={() => onCardClick(offerPreview.publicKey)}
                isOpen={visibleOfferPubkey === offerPreview.publicKey}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default OffersTokenTabContent
