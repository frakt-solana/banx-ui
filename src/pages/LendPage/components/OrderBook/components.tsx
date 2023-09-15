import { FC } from 'react'

import classNames from 'classnames'

import { Button } from '@banx/components/Buttons'

import { ChevronDown } from '@banx/icons'

import Offer from '../Offer'
import { OrderBookParams } from './hooks'

import styles from './OrderBook.module.less'

export const OrderBookList: FC<{ orderBookParams: OrderBookParams }> = ({ orderBookParams }) => {
  const { offers, goToEditOffer, isOwnOffer, bestOffer } = orderBookParams || {}

  return (
    <ul className={styles.list}>
      {offers.map((offer, idx) => (
        <Offer
          key={idx}
          offer={offer}
          editOffer={() => {
            goToEditOffer(offer)
          }}
          isOwnOffer={isOwnOffer(offer)}
          bestOffer={bestOffer}
        />
      ))}
    </ul>
  )
}

export const OrderBookLabel = () => (
  <div className={styles.label}>
    <span>Offers</span>
    <span>Number of loans</span>
  </div>
)

export const NoActiveOffers = () => (
  <div className={styles.noData}>
    <p className={styles.noDataTitle}>No active offers at the moment</p>
    <p className={styles.noDataSubtitle}>Good chance to be first!</p>
  </div>
)

interface ChevronMobileButtonProps {
  isOrderBookOpen: boolean
  onToggleVisible: () => void
}

export const ChevronMobileButton: FC<ChevronMobileButtonProps> = ({
  isOrderBookOpen,
  onToggleVisible,
}) => (
  <Button
    type="circle"
    variant="secondary"
    onClick={onToggleVisible}
    className={classNames(styles.chevronButton, { [styles.active]: isOrderBookOpen })}
  >
    <ChevronDown />
  </Button>
)

interface CollapsedMobileContentProps {
  collectionName?: string
  collectionImage?: string
  totalUserOffers?: number
}

export const CollapsedMobileContent: FC<CollapsedMobileContentProps> = ({
  collectionName = '',
  collectionImage = '',
  totalUserOffers = 0,
}) => (
  <div className={styles.collapsedMobileContent}>
    <img className={styles.collapsedMobileImage} src={collectionImage} />
    <div className={styles.collectionMobileInfo}>
      <p className={styles.collectionMobileTitle}>{collectionName} offers</p>
      <p className={styles.collectionMobileSubtitle}>Mine: {totalUserOffers}</p>
    </div>
  </div>
)
