import { FC } from 'react'

import { PUBKEY_PLACEHOLDER } from 'fbonds-core/lib/fbond-protocol/constants'

import { OfferMode, OrderBookMarketParams } from '../ExpandableCardContent'
import PlaceLiteOffer from './PlaceLiteOffer'
import PlaceProOffer from './PlaceProOffer'
import { OfferHeader, SwitchModeButtons } from './components'
import { usePlaceOffer } from './hooks/usePlaceOffer'

import styles from './PlaceOfferTab.module.less'

const PlaceOfferTab: FC<OrderBookMarketParams> = (props) => {
  const { ...offerParams } = usePlaceOffer(props)

  const { offerPubkey, onChangeOfferMode, exitEditMode, offerMode } = offerParams

  const isEditMode = !!offerPubkey && offerPubkey !== PUBKEY_PLACEHOLDER

  return (
    <div className={styles.content}>
      <OfferHeader isEditMode={isEditMode} exitEditMode={exitEditMode} />
      <SwitchModeButtons mode={offerMode} onChange={onChangeOfferMode} />
      {offerMode === OfferMode.Lite && <PlaceLiteOffer {...offerParams} />}
      {offerMode === OfferMode.Pro && <PlaceProOffer {...offerParams} />}
    </div>
  )
}

export default PlaceOfferTab
