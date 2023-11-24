import FilterSection from '../FilterSection'
import OfferCard from './components/OfferCard'
import { useOffersTabContent } from './hooks'

import styles from './OffersTabContent.module.less'

const OffersTabContent = () => {
  const { data: loansAndOffers, searchSelectParams, sortParams } = useOffersTabContent()

  return (
    <div>
      <FilterSection searchSelectParams={searchSelectParams} sortParams={sortParams} />
      <div className={styles.cardsList}>
        {loansAndOffers.map((data) => (
          <OfferCard key={data.offer.publicKey} {...data} />
        ))}
      </div>
    </div>
  )
}

export default OffersTabContent
