import { FC } from 'react'

import Offer from '../Offer'
import { Order } from './types'

import styles from './OrderBook.module.less'

interface OrderBookListProps {
  orders: Order[]
  goToEditOrder: (orderPubkey: string) => void
  isOwnOrder: (offer: Order) => boolean
}

export const OrderBookList: FC<{ orderBookParams: OrderBookListProps }> = ({ orderBookParams }) => {
  const { orders, goToEditOrder, isOwnOrder } = orderBookParams || {}

  return (
    <ul className={styles.list}>
      {orders.map((order, idx) => (
        <Offer
          key={idx}
          order={order}
          loanValue={order.loanValue}
          loanAmount={order.loansAmount}
          editOffer={() => goToEditOrder(order?.rawData?.publicKey)}
          isOwnOrder={isOwnOrder(order)}
        />
      ))}
    </ul>
  )
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
