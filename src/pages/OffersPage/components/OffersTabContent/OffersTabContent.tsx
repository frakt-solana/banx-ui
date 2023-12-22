import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import FilterSection from '../FilterSection'
import OfferCard from './components/OfferCard'
import Summary from './components/Summary'
import { useOffersContent } from './hooks'

import styles from './OffersTabContent.module.less'

const OffersTabContent = () => {
  const { offers, isLoading, showEmptyList, updateOrAddOffer, searchSelectParams, sortParams } =
    useOffersContent()

  if (showEmptyList) return <EmptyList message="Lend SOL to view your pending offers" />

  return (
    <div className={styles.content}>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <FilterSection searchSelectParams={searchSelectParams} sortParams={sortParams} />

          <div className={styles.cardsList}>
            {offers.map((offer) => (
              <OfferCard key={offer.offer.publicKey} offer={offer} />
            ))}
          </div>

          <Summary updateOrAddOffer={updateOrAddOffer} offers={offers} />
        </>
      )}
    </div>
  )
}

export default OffersTabContent
