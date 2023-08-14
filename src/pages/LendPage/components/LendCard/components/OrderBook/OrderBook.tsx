import { FC, useState } from 'react'

import classNames from 'classnames'

import { MarketPreview } from '@banx/api/bonds'

import {
  ChevronMobileButton,
  CollapsedMobileContent,
  OrderBookLabel,
  OrderBookList,
} from './components'
import { OrderBookParams, useOrderBook } from './hooks'

import styles from './OrderBook.module.less'

const OrderBookDesktop: FC<{ orderBookParams: OrderBookParams }> = ({ orderBookParams }) => (
  <div className={styles.orderBook}>
    <h5 className={styles.title}>Offers</h5>
    <OrderBookLabel />
    <div className={classNames(styles.content, { [styles.visible]: !orderBookParams?.orders })}>
      <OrderBookList orderBookParams={orderBookParams} />
    </div>
  </div>
)

interface OrderBookMobileProps {
  marketPreview?: MarketPreview
  orderBookParams: OrderBookParams
}

const OrderBookMobile: FC<OrderBookMobileProps> = ({ marketPreview, orderBookParams }) => {
  const [isOrderBookOpen, setOrderBookOpen] = useState<boolean>(false)

  const toggleOrderBook = () => {
    setOrderBookOpen(!isOrderBookOpen)
  }

  const { collectionImage: marketImage, collectionName: marketName } = marketPreview || {}

  return (
    <div className={classNames(styles.orderBookMobile, { [styles.open]: isOrderBookOpen })}>
      <div className={styles.collapsedContentWrapper}>
        <CollapsedMobileContent collectionImage={marketImage} collectionName={marketName} />
        <ChevronMobileButton onToggleVisible={toggleOrderBook} />
      </div>
      {isOrderBookOpen && (
        <div className={styles.mobileContent}>
          <OrderBookList orderBookParams={orderBookParams} />
        </div>
      )}
    </div>
  )
}

const OrderBook: FC<{ marketPubkey: string }> = ({ marketPubkey }) => {
  const { orderBookParams, selectedMarketPreview } = useOrderBook(marketPubkey)

  return (
    <>
      <OrderBookDesktop orderBookParams={orderBookParams} />
      <OrderBookMobile orderBookParams={orderBookParams} marketPreview={selectedMarketPreview} />
    </>
  )
}

export default OrderBook
