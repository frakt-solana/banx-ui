import OfferLite from '../Offer'

import styles from './OrderBook.module.less'

export const OrderBookList = () => {
  const offers = ['1', '2', '3']

  const renderOffer = () => {
    return <OfferLite />
  }

  return <ul className={styles.list}>{offers.map(renderOffer)}</ul>
}

export const OrderBookLabel = () => (
  <div className={styles.label}>
    <span>Offers</span>
    <span>Number of loans</span>
  </div>
)

export const NoActiveOffers = () => (
  <div className={styles.noData}>
    <div className={styles.noDataTitle}>No active offers at the moment</div>
    <div className={styles.noDataSubtitle}>Good chance to be first!</div>
  </div>
)
