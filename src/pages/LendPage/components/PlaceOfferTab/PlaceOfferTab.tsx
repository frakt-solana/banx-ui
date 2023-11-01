import { FC } from 'react'

import { OFFER_MODE, OrderBookMarketParams } from '../ExpandableCardContent'
import PlaceLiteOffer from './PlaceLiteOffer'
import PlaceProOffer from './PlaceProOffer'
import { OfferHeader, SwitchModeButtons } from './components'
import { usePlaceOffer } from './hooks/usePlaceOffer'

import styles from './PlaceOfferTab.module.less'

const PlaceOfferTab: FC<OrderBookMarketParams> = (props) => {
  const { ...offerParams } = usePlaceOffer(props)

  const { offerPubkey, onChangeOfferMode, exitEditMode, offerMode } = offerParams

  const isEditMode = !!offerPubkey

  return (
    <div className={styles.content}>
      <OfferHeader isEditMode={isEditMode} exitEditMode={exitEditMode} />
      <SwitchModeButtons mode={offerMode} onChange={onChangeOfferMode} />
      {offerMode === OFFER_MODE.LITE && <PlaceLiteOffer {...props} />}
      {offerMode === OFFER_MODE.PRO && <PlaceProOffer {...offerParams} />}
    </div>
  )
}

export default PlaceOfferTab
