import { useEffect, useMemo, useState } from 'react'

import { Tab, useTabs } from '@banx/components/Tabs'

import { useSyntheticOffers } from '@banx/store'
import { toLowerCaseNoSpaces, trackPageEvent } from '@banx/utils'

import { checkIsEditMode } from '../PlaceOfferTab'

export enum OfferMode {
  Lite = 'lite',
  Pro = 'pro',
}

export interface OrderBookMarketParams {
  marketPubkey: string
  offerPubkey: string
  setOfferPubkey: (offerPubkey: string) => void
  goToPlaceOfferTab: () => void
  offerMode: OfferMode
  onChangeOfferMode: (value: OfferMode) => void
}

export const useExpandableCardContent = (marketPubkey: string) => {
  const { findOffer } = useSyntheticOffers()
  const [offerMode, setOfferMode] = useState<OfferMode>(OfferMode.Lite)

  const syntheticOffer = useMemo(() => {
    return findOffer(marketPubkey)
  }, [findOffer, marketPubkey])

  useEffect(() => {
    if (syntheticOffer?.isEdit && syntheticOffer.deltaValue) {
      setOfferMode(OfferMode.Pro)
    }
  }, [syntheticOffer])

  const [offerPubkey, setOfferPubkey] = useState(syntheticOffer?.publicKey || '')

  const {
    tabs: bondTabs,
    value: tabValue,
    setValue: setTabValue,
  } = useTabs({ tabs: BONDS_TABS, defaultValue: BONDS_TABS[1].value })

  const goToPlaceOfferTab = () => {
    setTabValue(BONDS_TABS[1].value)
  }

  const onTabClick = (tabProps: Tab) => {
    trackPageEvent('lend', `${toLowerCaseNoSpaces(tabProps.label)}tab`)
  }

  return {
    goToPlaceOfferTab,
    isEditMode: checkIsEditMode(offerPubkey),

    marketParams: {
      marketPubkey,
      offerPubkey,
      setOfferPubkey,
      goToPlaceOfferTab,
      offerMode,
      onChangeOfferMode: setOfferMode,
    },
    tabsParams: {
      tabs: bondTabs,
      value: tabValue,
      setValue: setTabValue,
      onTabClick,
    },
  }
}

export const BONDS_TABS = [
  {
    label: 'Activity',
    value: 'activity',
  },
  {
    label: 'Place offer',
    value: 'offer',
  },
]
