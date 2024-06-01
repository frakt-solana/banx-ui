import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import FilterSection from '../FilterSection'
import OfferTokenCard from '../OfferTokenCard'
import Summary from '../Summary'
import { useOffersTokenContent } from './hooks'

import styles from './OffersTokenTabContent.module.less'

const OffersTokenTabContent = () => {
  const { offers, isLoading, showEmptyList, searchSelectParams, sortParams, emptyListParams } =
    useOffersTokenContent()

  if (showEmptyList) return <EmptyList {...emptyListParams} />

  return (
    <div className={styles.content}>
      {isLoading ? (
        <Loader size="small" />
      ) : (
        <>
          <FilterSection searchSelectParams={searchSelectParams} sortParams={sortParams} />

          <div className={styles.offersList}>
            {offers.map((offer) => (
              <OfferTokenCard key={offer.publicKey} offerPreview={offer} />
            ))}
          </div>

          <Summary offers={offers} />
        </>
      )}
    </div>
  )
}

export default OffersTokenTabContent
