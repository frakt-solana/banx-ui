import { FC } from 'react'

import { OfferMode } from '../../pages/LendPage/components/ExpandableCardContent'
import PlaceOfferContent from './PlaceOfferContent'
import { OfferHeader, SwitchModeButtons } from './components'
import { checkIsEditMode } from './helpers'
import { usePlaceOffer } from './hooks'

import styles from './PlaceOfferSection.module.less'

interface PlaceOfferSectionProps {
  offerMode: OfferMode
  onChangeOfferMode: (value: OfferMode) => void
  setOfferPubkey: (offerPubkey: string) => void
  offerPubkey: string
  marketPubkey: string
}

const PlaceOfferSection: FC<PlaceOfferSectionProps> = ({
  offerMode,
  onChangeOfferMode,
  offerPubkey,
  marketPubkey,
  setOfferPubkey,
}) => {
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
      <SwitchModeButtons mode={offerMode} onChange={onChangeOfferMode} offer={optimisticOffer} />
      <PlaceOfferContent {...offerParams} />
    </div>
  )
}

export default PlaceOfferSection
