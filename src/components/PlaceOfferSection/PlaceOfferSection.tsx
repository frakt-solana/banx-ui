import { FC } from 'react'

import PlaceOfferContent from './PlaceOfferContent'
import { usePlaceOffer } from './hooks'

interface PlaceOfferSectionProps {
  offerPubkey: string
  marketPubkey: string
  setOfferPubkey?: (offerPubkey: string) => void
}

const PlaceOfferSection: FC<PlaceOfferSectionProps> = (props) => {
  const offerParams = usePlaceOffer(props)

  return <PlaceOfferContent {...offerParams} />
}

export default PlaceOfferSection
