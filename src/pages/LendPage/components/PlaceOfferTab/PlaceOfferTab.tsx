import { FC } from 'react'

import { OrderBookMarketParams } from '../ExpandableCardContent'
// import PlaceLiteOffer from './PlaceLiteOffer'
import PlaceProOffer from './PlaceProOffer'
import { OfferHeader } from './components'

import styles from './PlaceOfferTab.module.less'

const PlaceOfferTab: FC<OrderBookMarketParams> = (props) => {
  const isEditMode = false
  const exitEditMode = () => null

  return (
    <div className={styles.content}>
      <OfferHeader isEditMode={isEditMode} exitEditMode={exitEditMode} />
      {/* <PlaceLiteOffer {...props} /> */}
      <PlaceProOffer {...props} />
    </div>
  )
}

export default PlaceOfferTab
