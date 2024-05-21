import { FC } from 'react'

import { Loader } from '@banx/components/Loader'
import Tooltip from '@banx/components/Tooltip/Tooltip'

import { SyntheticOffer, useModal, useSyntheticOffers } from '@banx/store/common'

import Offer from '../Offer'
import { useMarketOrders } from './hooks'

import styles from './OrderBook.module.less'

export interface OrderBookProps {
  marketPubkey: string
  offerPubkey: string
  setOfferPubkey: (offerPubkey: string) => void
}

const OrderBook: FC<OrderBookProps> = (props) => {
  const { offerPubkey, setOfferPubkey, marketPubkey } = props

  const { close } = useModal()
  const { setOffer: setSyntheticOffer } = useSyntheticOffers()
  const { offers, market, isLoading } = useMarketOrders({ marketPubkey, offerPubkey })

  const handleEditOffer = (offer: SyntheticOffer) => {
    setSyntheticOffer({ ...offer, isEdit: true })
    setOfferPubkey(offer.publicKey)
    close()
  }

  return (
    <div className={styles.orderBook}>
      <div className={styles.labelsWrapper}>
        <Label title="Max offer" tooltipText="Max offers pending for this collection" />
        <Label
          title="Max Apr"
          tooltipText="Max annual interest rate each offer will yield if max offer size is taken"
        />
        <Label title="Number of offers" />
      </div>

      <ul className={styles.offersList}>
        {isLoading && <Loader size="small" />}

        {!isLoading &&
          offers.map((offer) => (
            <Offer
              key={offer.publicKey}
              offer={offer}
              editOffer={() => handleEditOffer(offer)}
              collectionFloor={market?.collectionFloor || 0}
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
