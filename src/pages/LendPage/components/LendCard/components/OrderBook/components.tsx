import { FC } from 'react'

import Offer from '../Offer'
import { MarketOrder } from './types'

import styles from './OrderBook.module.less'

interface OrderBookListProps {
  offers: MarketOrder[]
  goToEditOffer: (publicKey: string) => void
  isOwnOrder: (offer: MarketOrder) => boolean
}

export const OrderBookList: FC<{ orderBookParams: OrderBookListProps }> = ({ orderBookParams }) => {
  const { offers, goToEditOffer, isOwnOrder } = orderBookParams || {}

  const renderOffer = (offer: MarketOrder) => {
    return (
      <Offer
        offer={offer}
        loanValue={offer.loanValue}
        loanAmount={offer.loansAmount}
        editOffer={() => goToEditOffer(offer?.rawData?.publicKey)}
        isOwnOrder={isOwnOrder(offer)}
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
