import { FC } from 'react'

import { OFFER_MODE, OrderBookMarketParams } from '../ExpandableCardContent'
import PlaceLiteOffer from './PlaceLiteOffer'
import PlaceProOffer from './PlaceProOffer'
import { OfferHeader, SwitchModeButtons } from './components'

import styles from './PlaceOfferTab.module.less'

const PlaceOfferTab: FC<OrderBookMarketParams> = (props) => {
  const { offerMode, onChangeOfferMode, setOfferPubkey, offerPubkey } = props || {}

  const isEditMode = !!offerPubkey

  const exitEditMode = () => {
    setOfferPubkey('')
  }

  return (
    <div className={styles.content}>
      <OfferHeader isEditMode={isEditMode} exitEditMode={exitEditMode} />
      <SwitchModeButtons mode={offerMode} onChange={onChangeOfferMode} />
      {offerMode === OFFER_MODE.LITE && <PlaceLiteOffer {...props} />}
      {offerMode === OFFER_MODE.PRO && <PlaceProOffer {...props} />}
    </div>
  )
}

export default PlaceOfferTab
