import { useEffect, useMemo, useState } from 'react'

import { Tab, useTabs } from '@banx/components/Tabs'

import { useSyntheticOffers } from '@banx/store'
import { toLowerCaseNoSpaces, trackPageEvent } from '@banx/utils'

import { BONDS_TABS, DEFAULT_TAB } from './constants'

export interface OrderBookMarketParams {
  marketPubkey: string
  offerPubkey: string
  setOfferPubkey: (offerPubkey: string) => void
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
  } = useTabs({ tabs: BONDS_TABS, defaultValue: DEFAULT_TAB })

  const goToPlaceOfferTab = () => {
    setTabValue(BONDS_TABS[1].value)
  }

  useEffect(() => {
    if (offerPubkey) {
      setTabValue(DEFAULT_TAB)
    }
  }, [offerPubkey, setTabValue])

  const onTabClick = (tabProps: Tab) => {
    trackPageEvent('lend', `${toLowerCaseNoSpaces(tabProps.label)}tab`)
  }

  return {
    goToPlaceOfferTab,
    marketParams: {
      marketPubkey,
      offerPubkey,
      setOfferPubkey,
    },
    tabsParams: {
      tabs: bondTabs,
      value: tabValue,
      setValue: setTabValue,
      onTabClick,
    },
  }
}
