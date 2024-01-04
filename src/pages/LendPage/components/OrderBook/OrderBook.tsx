import { FC, useState } from 'react'

import classNames from 'classnames'

import { MarketPreview } from '@banx/api/core'

import { CollapsedMobileContent, OrderBookLabels, OrderBookList } from './components'
import { OrderBookParams, useOrderBook } from './hooks'

import styles from './OrderBook.module.less'

export interface OrderBookProps {
  marketPubkey: string
  offerPubkey: string
  setOfferPubkey: (offerPubkey: string) => void
  goToPlaceOfferTab: () => void
}

const OrderBookDesktop: FC<{ orderBookParams: OrderBookParams }> = ({ orderBookParams }) => {
  return (
    <div className={styles.orderBookWrapper}>
      <div className={styles.orderBook}>
        <OrderBookLabels />
        <OrderBookList orderBookParams={orderBookParams} />
      </div>
    </div>
  )
}

interface OrderBookMobileProps {
  market: MarketPreview | undefined
  orderBookParams: OrderBookParams
}

const OrderBookMobile: FC<OrderBookMobileProps> = ({ market, orderBookParams }) => {
  const { userOffers } = orderBookParams

  const [isOpen, setIsOpen] = useState<boolean>(false)

  const toggleOrderBook = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={classNames(styles.orderBookMobile, { [styles.open]: isOpen })}>
      <CollapsedMobileContent
        collectionImage={market?.collectionImage}
        collectionName={market?.collectionName}
        totalUserOffers={userOffers.length}
        isOrderBookOpen={isOpen}
        onToggleVisible={toggleOrderBook}
      />
      {isOpen && (
        <>
          <OrderBookLabels className={styles.mobileLabels} />
          <OrderBookList
            orderBookParams={orderBookParams}
            closeOrderBook={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  )
}

const OrderBook: FC<OrderBookProps> = (props) => {
  const { market, ...orderBookParams } = useOrderBook(props)

  return (
    <>
      <OrderBookDesktop orderBookParams={orderBookParams} />
      <OrderBookMobile orderBookParams={orderBookParams} market={market} />
    </>
  )
}

export default OrderBook
