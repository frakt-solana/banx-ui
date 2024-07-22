import { FC } from 'react'

import classNames from 'classnames'

import { Loader } from '@banx/components/Loader'
import Tooltip from '@banx/components/Tooltip/Tooltip'

import { TokenMarketPreview } from '@banx/api/tokens'

import Offer from './Offer'
import { useMarketOrders } from './hooks'

import styles from './OrderBook.module.less'

export interface OrderBookProps {
  market: TokenMarketPreview | undefined
  offerPubkey?: string
  className?: string
}

const OrderBook: FC<OrderBookProps> = ({ market, offerPubkey = '', className }) => {
  const { marketPubkey = '', collateral, collateralPrice = 0 } = market || {}

  const { offers, isLoading } = useMarketOrders(marketPubkey, offerPubkey)

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
          offers.map((offer) => (
            <Offer
              key={offer.publicKey}
              offer={offer}
              collateral={collateral}
              collateralPrice={collateralPrice}
            />
          ))}
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
