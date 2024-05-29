import { FC } from 'react'

import classNames from 'classnames'

import { Loader } from '@banx/components/Loader'
import Tooltip from '@banx/components/Tooltip/Tooltip'

import Offer from './Offer'

import styles from './OrderBook.module.less'

export interface OrderBookProps {
  marketPubkey: string
  offerPubkey?: string
  className?: string
}

const OrderBook: FC<OrderBookProps> = ({ offerPubkey, marketPubkey, className }) => {
  const offers = [] as any[]
  const isLoading = false

  return (
    <div className={classNames(styles.orderBook, className)}>
      <div className={styles.labelsWrapper}>
        <Label title="Offer" tooltipText="Offer" />
        <Label title="Apr" tooltipText="Apr" />
        <Label title="Size" tooltipText="Size" />
      </div>

      <ul className={styles.offersList}>
        {isLoading && <Loader size="small" />}

        {!isLoading &&
          offers.map((offer, index) => <Offer key={index} collectionFloor={0} offer={offer} />)}
      </ul>
    </div>
  )
}

export default OrderBook

interface LabelProps {
  title: string
  tooltipText?: string
}
const Label: FC<LabelProps> = ({ title, tooltipText }) => (
  <div className={styles.labelWrapper}>
    <span className={styles.label}>{title}</span>
    {tooltipText && <Tooltip title={tooltipText} />}
  </div>
)
