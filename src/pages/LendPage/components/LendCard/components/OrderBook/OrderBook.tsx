import { FC, useState } from 'react'

import classNames from 'classnames'

import { MarketPreview } from '@banx/api/bonds'

import {
  ChevronMobileButton,
  CollapsedMobileContent,
  OrderBookLabel,
  OrderBookList,
} from './components'
import { useOrderBook } from './hooks'

import styles from './OrderBook.module.less'

const OrderBookDesktop: FC<{ orderBookParams: any }> = ({ orderBookParams }) => (
  <div className={styles.orderBook}>
    <h5 className={styles.title}>Offers</h5>
    <OrderBookLabel />
    <div className={classNames(styles.content, { [styles.visible]: !orderBookParams?.offers })}>
      <OrderBookList orderBookParams={orderBookParams} />
    </div>
  </div>
)

export const OrderBookMobile: FC<{
  marketPreview?: MarketPreview
  orderBookParams: any
}> = ({ marketPreview, orderBookParams }) => {
  const [open, setOpen] = useState(false)

  return (
    <div className={classNames(styles.orderBookMobile, { [styles.open]: open })}>
      <div className={styles.collapsedContentWrappper}>
        <CollapsedMobileContent
          collectionImage={marketPreview?.collectionImage}
          collectionName={marketPreview?.collectionName}
        />
        <ChevronMobileButton onToggleVisible={() => setOpen(!open)} />
      </div>
      <div className={styles.mobileContent}>
        <OrderBookList orderBookParams={orderBookParams} />
      </div>
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
