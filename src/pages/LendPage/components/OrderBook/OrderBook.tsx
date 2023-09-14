import { FC, useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'

import { MarketPreview } from '@banx/api/core'

import { OrderBookMarketParams } from '../ExpandableCardContent'
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
    <div className={classNames(styles.content, { [styles.visible]: !orderBookParams?.offers })}>
      <OrderBookList orderBookParams={orderBookParams} />
    </div>
  </div>
)

interface OrderBookMobileProps {
  marketPreview?: MarketPreview
  orderBookParams: OrderBookParams
}

const OrderBookMobile: FC<OrderBookMobileProps> = ({ marketPreview, orderBookParams }) => {
  const { publicKey } = useWallet()
  const [isOrderBookOpen, setOrderBookOpen] = useState<boolean>(false)

  const toggleOrderBook = () => {
    setOrderBookOpen(!isOrderBookOpen)
  }

  const { collectionImage, collectionName } = marketPreview || {}
  const { offers } = orderBookParams || {}

  const userOrders = useMemo(() => {
    return offers.filter((offer) => offer.assetReceiver === publicKey?.toBase58())
  }, [offers, publicKey])

  return (
    <div className={classNames(styles.orderBookMobile, { [styles.open]: isOrderBookOpen })}>
      <div className={styles.collapsedContentWrapper}>
        <CollapsedMobileContent
          collectionImage={collectionImage}
          collectionName={collectionName}
          totalUserOrders={userOrders.length}
        />
        <ChevronMobileButton isOrderBookOpen={isOrderBookOpen} onToggleVisible={toggleOrderBook} />
      </div>
      {isOrderBookOpen && (
        <div className={styles.mobileContent}>
          <OrderBookList orderBookParams={orderBookParams} />
        </div>
      )}
    </div>
  )
}

const OrderBook: FC<OrderBookMarketParams> = (props) => {
  const { orderBookParams, selectedMarketPreview } = useOrderBook(props)

  return (
    <>
      <OrderBookDesktop orderBookParams={orderBookParams} />
      <OrderBookMobile orderBookParams={orderBookParams} marketPreview={selectedMarketPreview} />
    </>
  )
}

export default OrderBook
