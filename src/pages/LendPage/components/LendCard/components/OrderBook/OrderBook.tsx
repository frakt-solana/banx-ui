import { FC } from 'react'

import classNames from 'classnames'

import { OrderBookLabel, OrderBookList } from './components'
import { useOrderBook } from './hooks'

import styles from './OrderBook.module.less'

const OrderBook: FC<{ marketPubkey: string }> = ({ marketPubkey }) => {
  const { orderBookParams } = useOrderBook(marketPubkey)

  return (
    <div className={styles.orderBook}>
      <h5 className={styles.title}>Offers</h5>
      <OrderBookLabel />
      <div className={classNames(styles.content, { [styles.visible]: false })}>
        <OrderBookList orderBookParams={orderBookParams} />
      </div>
    </div>
  )
}

export default OrderBook
