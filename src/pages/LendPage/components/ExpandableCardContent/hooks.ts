import { useMemo, useState } from 'react'

import { checkIsEditMode } from '@banx/components/PlaceOfferSection'
import { Tab, useTabs } from '@banx/components/Tabs'

import { useSyntheticOffers } from '@banx/store'
import { toLowerCaseNoSpaces, trackPageEvent } from '@banx/utils'

export interface OrderBookMarketParams {
  marketPubkey: string
  offerPubkey: string
  setOfferPubkey: (offerPubkey: string) => void
  goToPlaceOfferTab: () => void
}

export const useExpandableCardContent = (marketPubkey: string) => {
  const { findOffer } = useSyntheticOffers()

  const syntheticOffer = useMemo(() => {
    return findOffer(marketPubkey)
  }, [findOffer, marketPubkey])

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
