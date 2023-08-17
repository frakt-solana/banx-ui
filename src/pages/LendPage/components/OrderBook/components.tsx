import { FC } from 'react'

import { Button } from '@banx/components/Buttons'

import { ChevronDown } from '@banx/icons'

import Offer from '../Offer'
import { OrderBookParams } from './hooks'

import styles from './OrderBook.module.less'

export const OrderBookList: FC<{ orderBookParams: OrderBookParams }> = ({ orderBookParams }) => {
  const { orders, goToEditOrder, isOwnOrder, bestOrder } = orderBookParams || {}

  return (
    <ul className={styles.list}>
      {orders.map((order, idx) => (
        <Offer
          key={idx}
          order={order}
          loanValue={order.loanValue}
          loanAmount={order.loansAmount}
          editOffer={() => goToEditOrder(order?.rawData?.publicKey)}
          isOwnOrder={isOwnOrder(order)}
          bestOrder={bestOrder}
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

export const ChevronMobileButton = ({ onToggleVisible }: { onToggleVisible: () => void }) => (
  <Button
    type="circle"
    variant="secondary"
    onClick={onToggleVisible}
    className={styles.chevronButton}
  >
    <ChevronDown />
  </Button>
)

interface CollapsedMobileContentProps {
  collectionName?: string
  collectionImage?: string
  totalUserOrders?: number
}

export const CollapsedMobileContent: FC<CollapsedMobileContentProps> = ({
  collectionName = '',
  collectionImage = '',
  totalUserOrders = 0,
}) => (
  <div className={styles.collapsedMobileContent}>
    <img className={styles.collapsedMobileImage} src={collectionImage} />
    <div className={styles.collectionMobileInfo}>
      <p className={styles.collectionMobileTitle}>{collectionName}</p>
      <p className={styles.collectionMobileSubtitle}>Mine: {totalUserOrders}</p>
    </div>
  </div>
)
