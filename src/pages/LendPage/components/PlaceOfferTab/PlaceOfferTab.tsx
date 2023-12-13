import { FC } from 'react'

import { OfferMode, OrderBookMarketParams } from '../ExpandableCardContent'
import PlaceProOffer from './PlaceProOffer'
import { OfferHeader, SwitchModeButtons } from './components'
import { checkIsEditMode } from './helpers'
import { usePlaceOffer } from './hooks'

import styles from './PlaceOfferTab.module.less'

interface PlaceOfferTabProps extends OrderBookMarketParams {
  offerMode: OfferMode
  onChangeOfferMode: (value: OfferMode) => void
}

const PlaceOfferTab: FC<PlaceOfferTabProps> = (props) => {
  const { offerMode, offerPubkey, onChangeOfferMode } = props

  const offerParams = usePlaceOffer(props)
  const { exitEditMode, optimisticOffer } = offerParams

  return (
    <div className={styles.content}>
      <OfferHeader isEditMode={checkIsEditMode(offerPubkey)} exitEditMode={exitEditMode} />
      <SwitchModeButtons mode={offerMode} onChange={onChangeOfferMode} offer={optimisticOffer} />
      <PlaceProOffer {...offerParams} />
    </div>
  )
}

export default PlaceOfferTab
