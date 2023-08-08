import classNames from 'classnames'

import { OrderBookLabel, OrderBookList } from './components'

import styles from './OrderBook.module.less'

const OrderBook = () => {
  return (
    <div className={styles.orderBook}>
      <h5 className={styles.title}>Offers</h5>
      <OrderBookLabel />
      <div className={classNames(styles.content, { [styles.visible]: false })}>
        <OrderBookList />
      </div>
    </div>
  )
}

export default OrderBook
