import { FC } from 'react'

import Offer from '../Offer'

import styles from './OrderBook.module.less'

export const OrderBookList: FC<any> = ({ orderBookParams }) => {
  const { offers, goToEditOffer, isOwnOrder } = orderBookParams || {}

  const renderOffer = (offer: any) => {
    return (
      <Offer
        offer={offer}
        loanValue={offer.loanValue}
        loanAmount={offer.loanAmount}
        isOwnOrder={isOwnOrder(offer)}
        editOffer={() => goToEditOffer(offer?.rawData?.publicKey)}
      />
    )
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
