import { FC } from 'react'

import PlaceOfferContent from './PlaceOfferContent'
import { OfferHeader } from './components'
import { checkIsEditMode } from './helpers'
import { usePlaceOffer } from './hooks'

import styles from './PlaceOfferSection.module.less'

interface PlaceOfferSectionProps {
  offerPubkey: string
  marketPubkey: string
  setOfferPubkey?: (offerPubkey: string) => void
}

const PlaceOfferSection: FC<PlaceOfferSectionProps> = ({
  offerPubkey,
  marketPubkey,
  setOfferPubkey,
}) => {
  const offerParams = usePlaceOffer({
    offerPubkey,
    marketPubkey,
    setOfferPubkey,
  })

  const { exitEditMode } = offerParams

  return (
    <div className={styles.content}>
      {setOfferPubkey && (
        <OfferHeader isEditMode={checkIsEditMode(offerPubkey)} exitEditMode={exitEditMode} />
      )}
      <PlaceOfferContent {...offerParams} />
    </div>
  )
}

export default PlaceOfferSection
