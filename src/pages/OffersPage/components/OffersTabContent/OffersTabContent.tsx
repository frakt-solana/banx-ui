import OfferCard from './components/OfferCard'
import { useLenderLoansAndOffers } from './hooks'

import styles from './OffersTabContent.module.less'

const OffersTabContent = () => {
  const { data: loansAndOffers } = useLenderLoansAndOffers()

  return (
    <div className={styles.cardsList}>
      {loansAndOffers.map((data) => (
        <OfferCard key={data.offer.publicKey} {...data} />
      ))}
    </div>
  )
}

export default OffersTabContent
