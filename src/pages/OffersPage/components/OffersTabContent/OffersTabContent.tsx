import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import FilterSection from '../FilterSection'
import OfferCard from './components/OfferCard'
import Summary from './components/Summary'
import { useOffersTabContent } from './hooks'

import styles from './OffersTabContent.module.less'

const OffersTabContent = () => {
  const {
    data: loansAndOffers,
    isLoading,
    searchSelectParams,
    sortParams,
    showEmptyList,
    updateOrAddOffer,
    offers,
  } = useOffersTabContent()

  if (showEmptyList) return <EmptyList message="Lend SOL to view your pending offers" />

  return (
    <div className={styles.content}>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <FilterSection searchSelectParams={searchSelectParams} sortParams={sortParams} />

          <div className={styles.cardsList}>
            {loansAndOffers.map(({ offer, loans, collectionMeta }) => (
              <OfferCard
                key={offer.publicKey}
                offer={offer}
                loans={loans}
                collectionMeta={collectionMeta}
              />
            ))}
          </div>

          <Summary updateOrAddOffer={updateOrAddOffer} offers={offers} />
        </>
      )}
    </div>
  )
}

export default OffersTabContent
