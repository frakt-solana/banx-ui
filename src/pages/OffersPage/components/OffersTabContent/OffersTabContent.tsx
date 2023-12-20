import { useEffect } from 'react'

import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import { useIntersection } from '@banx/hooks'

import FilterSection from '../FilterSection'
import OfferCard from './components/OfferCard'
import Summary from './components/Summary'
import { useOffersContent } from './hooks/useOffersTabContent'

import styles from './OffersTabContent.module.less'

const OffersTabContent = () => {
  const { ref, inView } = useIntersection()

  const {
    offers,
    isLoading,
    showEmptyList,
    updateOrAddOffer,
    searchSelectParams,
    sortParams,
    hasNextPage,
    fetchNextPage,
  } = useOffersContent()

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, fetchNextPage, hasNextPage])

  if (showEmptyList) return <EmptyList message="Lend SOL to view your pending offers" />

  return (
    <div className={styles.content}>
      <FilterSection searchSelectParams={searchSelectParams} sortParams={sortParams} />

      {isLoading ? (
        <Loader />
      ) : (
        <div className={styles.cardsList}>
          {offers.map((offer) => (
            <OfferCard key={offer.offer.publicKey} offer={offer} />
          ))}
          <div ref={ref} />
        </div>
      )}

      <Summary updateOrAddOffer={updateOrAddOffer} offers={offers} />
    </div>
  )
}

export default OffersTabContent
