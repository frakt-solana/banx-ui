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
    isLoading,
    showEmptyList,
    searchSelectParams,
    sortParams,
    emptyListParams,
    visibleOfferPubkey,
    onCardClick,
  } = useOffersTokenContent()

  if (showEmptyList) return <EmptyList {...emptyListParams} />

  return (
    <div className={styles.content}>
      <FilterSection searchSelectParams={searchSelectParams} sortParams={sortParams} />

      {isLoading && <Loader />}

      {!isLoading && (
        <>
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

          <Summary offersPreview={offersPreview} />
        </>
      )}
    </div>
  )
}

export default OffersTokenTabContent
