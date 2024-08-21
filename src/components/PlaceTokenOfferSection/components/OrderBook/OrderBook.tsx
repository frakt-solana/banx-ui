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
  const { marketPubkey = '', collateral } = market || {}

  const { offers, isLoading } = useMarketOrders(marketPubkey, offerPubkey)

  return (
    <div className={classNames(styles.orderBook, className)}>
      <div className={styles.labelsWrapper}>
        <Label title="Offer" tooltipText="The price per token you propose for lending" />
        <Label
          title="Apr"
          tooltipText="Annual interest rate. Depends on the loan-to-value (LTV) offered and market capitalization. Interest becomes fixed once offer is taken"
        />
        <Label
          title="Size"
          tooltipText="The total amount you are willing to lend at the proposed offer price"
        />
      </div>

      <ul className={styles.offersList}>
        {isLoading && <Loader size="small" />}

        {!isLoading &&
          offers.map((offer) => (
            <Offer key={offer.publicKey} offer={offer} collateral={collateral} />
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
