import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { Loader } from '@banx/components/Loader'

import { ChevronDown } from '@banx/icons'

import Offer from '../Offer'
import { OrderBookParams } from './hooks'

import styles from './OrderBook.module.less'

interface OrderBookListProps {
  orderBookParams: OrderBookParams
  closeOrderBook?: () => void
}

export const OrderBookList: FC<OrderBookListProps> = ({ orderBookParams, closeOrderBook }) => {
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
              closeOrderBook?.()
            }}
          />
        ))
      )}
    </ul>
  )
}

interface CollapsedMobileContentProps {
  collectionName?: string
  collectionImage?: string
  totalUserOffers?: number
  isOrderBookOpen: boolean
  onToggleVisible: () => void
}

export const CollapsedMobileContent: FC<CollapsedMobileContentProps> = ({
  collectionName = '',
  collectionImage = '',
  totalUserOffers = 0,
  isOrderBookOpen,
  onToggleVisible,
}) => (
  <div className={styles.collapsedContentWrapper}>
    <div className={styles.collapsedMobileContent}>
      <img className={styles.collapsedMobileImage} src={collectionImage} />
      <div className={styles.collectionMobileInfo}>
        <p className={styles.collectionMobileTitle}>{collectionName} offers</p>
        <p className={styles.collectionMobileSubtitle}>Mine: {totalUserOffers}</p>
      </div>
    </div>
    <Button
      type="circle"
      variant="secondary"
      onClick={onToggleVisible}
      className={classNames(styles.chevronButton, { [styles.active]: isOrderBookOpen })}
    >
      <ChevronDown />
    </Button>
  </div>
)

interface OrderBookLabelsProps {
  className?: string
}
export const OrderBookLabels: FC<OrderBookLabelsProps> = ({ className }) => (
  <div className={classNames(styles.labels, className)}>
    <span>Max offers</span>
    <span>Number of offers</span>
  </div>
)
