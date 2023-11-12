import { FC, useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'

import { MarketPreview } from '@banx/api/core'

import { OrderBookMarketParams } from '../ExpandableCardContent'
import {
  AccruedInterest,
  CollapsedMobileContent,
  OrderBookLabels,
  OrderBookList,
} from './components'
import { OrderBookParams, useOrderBook } from './hooks'

import styles from './OrderBook.module.less'

const OrderBookDesktop: FC<{ orderBookParams: OrderBookParams }> = ({ orderBookParams }) => (
  <div className={styles.orderBookWrapper}>
    <div className={styles.orderBook}>
      <OrderBookLabels />
      <OrderBookList orderBookParams={orderBookParams} />
    </div>
    <AccruedInterest onClick={() => null} value={26} />
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

  const totalUserOffers = useMemo(() => {
    const isNotSynthetic = (publicKey: string) => publicKey !== PUBKEY_PLACEHOLDER
    const isOwner = (assetReceiver: string) => assetReceiver === publicKey?.toBase58()

    const filtered = orderBookParams.offers.filter(
      ({ assetReceiver, publicKey }) => isOwner(assetReceiver) && isNotSynthetic(publicKey),
    )

    return filtered.length
  }, [orderBookParams.offers, publicKey])

  return (
    <div className={classNames(styles.orderBookMobile, { [styles.open]: isOrderBookOpen })}>
      <CollapsedMobileContent
        collectionImage={marketPreview?.collectionImage}
        collectionName={marketPreview?.collectionName}
        totalUserOffers={totalUserOffers}
        isOrderBookOpen={isOrderBookOpen}
        onToggleVisible={toggleOrderBook}
      />
      {isOrderBookOpen && (
        <>
          <OrderBookLabels className={styles.mobileLabels} />
          <OrderBookList
            className={styles.mobileOrderBookList}
            orderBookParams={orderBookParams}
            closeOrderBook={() => setOrderBookOpen(false)}
          />
          <AccruedInterest onClick={() => null} value={26} />
        </>
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
