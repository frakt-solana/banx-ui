import { FC } from 'react'

import PlaceOfferContent from './PlaceOfferContent'
import { OfferHeader, SwitchModeButtons, useOfferMode } from './components'
import { checkIsEditMode } from './helpers'
import { usePlaceOffer } from './hooks'

import styles from './PlaceOfferSection.module.less'

interface PlaceOfferSectionProps {
  setOfferPubkey: (offerPubkey: string) => void
  offerPubkey: string
  marketPubkey: string
}

const PlaceOfferSection: FC<PlaceOfferSectionProps> = ({
  offerPubkey,
  marketPubkey,
  setOfferPubkey,
}) => {
  const { mode: offerMode, onChange } = useOfferMode()

  const offerParams = usePlaceOffer({
    offerMode,
    offerPubkey,
    marketPubkey,
    setOfferPubkey,
  })

  const { exitEditMode, optimisticOffer } = offerParams

  return (
    <div className={styles.content}>
      <OfferHeader isEditMode={checkIsEditMode(offerPubkey)} exitEditMode={exitEditMode} />
      <SwitchModeButtons mode={offerMode} onChange={onChange} offer={optimisticOffer} />
      <PlaceOfferContent {...offerParams} />
    </div>
  )
}

export default PlaceOfferSection
