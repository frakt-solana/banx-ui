import { FC, useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'

import { MarketPreview, Offer } from '@banx/api/core'

import {
  AccruedInterest,
  CollapsedMobileContent,
  OrderBookLabels,
  OrderBookList,
} from './components'
import { OrderBookParams, useOrderBook } from './hooks'

import styles from './OrderBook.module.less'

export interface OrderBookMarketParams {
  marketPubkey: string
  offerPubkey: string
  setOfferPubkey: (offerPubkey: string) => void
  goToPlaceOfferTab: () => void
}

const OrderBookDesktop: FC<{ orderBookParams: OrderBookParams }> = ({ orderBookParams }) => {
  const { updateOrAddOffer, offers } = orderBookParams

  const { publicKey } = useWallet()

  const userOffers = useMemo(() => {
    return getUserOffers(offers, publicKey?.toBase58())
  }, [offers, publicKey])

  return (
    <div className={styles.orderBookWrapper}>
      <div className={styles.orderBook}>
        <OrderBookLabels />
        <OrderBookList orderBookParams={orderBookParams} />
      </div>
      <AccruedInterest offers={userOffers} updateOrAddOffer={updateOrAddOffer} />
    </div>
  )
}

interface OrderBookMobileProps {
  marketPreview?: MarketPreview
  orderBookParams: OrderBookParams
}

const OrderBookMobile: FC<OrderBookMobileProps> = ({ marketPreview, orderBookParams }) => {
  const { updateOrAddOffer, offers } = orderBookParams

  const { publicKey } = useWallet()
  const [isOrderBookOpen, setOrderBookOpen] = useState<boolean>(false)

  const toggleOrderBook = () => {
    setOrderBookOpen(!isOrderBookOpen)
  }

  const userOffers = useMemo(() => {
    return getUserOffers(offers, publicKey?.toBase58())
  }, [offers, publicKey])

  return (
    <div className={classNames(styles.orderBookMobile, { [styles.open]: isOrderBookOpen })}>
      <CollapsedMobileContent
        collectionImage={marketPreview?.collectionImage}
        collectionName={marketPreview?.collectionName}
        totalUserOffers={userOffers.length}
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
          <AccruedInterest offers={userOffers} updateOrAddOffer={updateOrAddOffer} />
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

const getUserOffers = (offers: Offer[], walletPubkey = '') => {
  const isNotSynthetic = (publicKey: string) => publicKey !== PUBKEY_PLACEHOLDER
  const isOwner = (assetReceiver: string) => assetReceiver === walletPubkey

  const userOffers = offers.filter(
    ({ assetReceiver, publicKey }) => isOwner(assetReceiver) && isNotSynthetic(publicKey),
  )

  return userOffers
}
