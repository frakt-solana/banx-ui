import { useEffect, useState } from 'react'

import { SyntheticOffer } from '@banx/store'

import { OfferMode } from '../components'

export const useOfferMode = (syntheticOffer: SyntheticOffer) => {
  const { deltaValue, isEdit } = syntheticOffer

  const defaultOfferMode = deltaValue ? OfferMode.Pro : OfferMode.Lite

  const [offerMode, setOfferMode] = useState(defaultOfferMode)

  useEffect(() => {
    if (!isEdit) return

    if (deltaValue) {
      return setOfferMode(OfferMode.Pro)
    }

    return setOfferMode(OfferMode.Lite)
  }, [syntheticOffer, isEdit, deltaValue])

  return { offerMode, onChangeOfferMode: setOfferMode }
}
