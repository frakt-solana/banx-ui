import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { ChevronDown } from '@banx/icons'

import Offer from '../Offer'
import { OrderBookParams } from './hooks'

import styles from './OrderBook.module.less'

interface OrderBookListProps {
  orderBookParams: OrderBookParams
  closeOrderBook?: () => void
  className?: string
}

export const OrderBookList: FC<OrderBookListProps> = ({
  orderBookParams,
  closeOrderBook,
  className,
}) => {
  const { offers, goToEditOffer, isOwnOffer, bestOffer, offerMode } = orderBookParams || {}

  return (
    <ul className={classNames(styles.orderBookList, { [styles.visible]: !offers }, className)}>
      {offers.map((offer, idx) => (
        <Offer
          key={idx}
          offer={offer}
          editOffer={() => {
            goToEditOffer(offer)
            closeOrderBook?.()
          }}
          offerMode={offerMode}
          isOwnOffer={isOwnOffer(offer)}
          bestOffer={bestOffer}
        />
      ))}
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

interface AccruedInterestProps {
  onClick: () => void
  value: number
}
export const AccruedInterest: FC<AccruedInterestProps> = ({ value, onClick }) => {
  return (
    <div className={styles.accruedInterestContainer}>
      <div className={styles.accruedInterestInfo}>
        <span className={styles.accruedInterestValue}>{createSolValueJSX(value)}</span>
        <span className={styles.accruedInterestLabel}>Total accrued interest</span>
      </div>
      <Button onClick={onClick}>Claim</Button>
    </div>
  )
}

interface OrderBookLabelsProps {
  className?: string
}
export const OrderBookLabels: FC<OrderBookLabelsProps> = ({ className }) => (
  <div className={classNames(styles.labels, className)}>
    <span>Offers</span>
    <span>Number of loans</span>
  </div>
)
