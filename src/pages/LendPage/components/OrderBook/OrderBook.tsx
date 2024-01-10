import { FC } from 'react'

import { Loader } from '@banx/components/Loader'

import Offer from '../Offer'
import { OrderBookParams, useOrderBook } from './hooks'

import styles from './OrderBook.module.less'

export interface OrderBookProps {
  marketPubkey: string
  offerPubkey: string
  setOfferPubkey: (offerPubkey: string) => void
}

const OrderBook: FC<OrderBookProps> = (props) => {
  const orderBookParams = useOrderBook(props)

  return (
    <div className={styles.orderBook}>
      <div className={styles.labels}>
        <span>Max offers</span>
        <span>Max Apr</span>
        <span>Offers amount</span>
      </div>
      <OrderBookList orderBookParams={orderBookParams} />
    </div>
  )
}

export default OrderBook

interface OrderBookListProps {
  orderBookParams: OrderBookParams
}

const OrderBookList: FC<OrderBookListProps> = ({ orderBookParams }) => {
  const { syntheticOffers, goToEditOffer, isLoading } = orderBookParams

  return (
    <ul className={styles.orderBookList}>
      {isLoading ? (
        <Loader size="small" />
      ) : (
        syntheticOffers.map((offer) => (
          <Offer
            key={offer.publicKey}
            offer={offer}
            editOffer={() => {
              goToEditOffer(offer)
            }}
          />
        ))
      )}
    </ul>
  )
}
