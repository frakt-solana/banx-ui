import { useEffect, useState } from 'react'

import { useTabs } from '@banx/components/Tabs'

import { SyntheticParams } from '../OrderBook'
import { BONDS_TABS, DEFAULT_TAB } from './constants'

export interface PlaceOfferParams {
  marketPubkey: string
  offerPubkey: string
  setOfferPubkey: (offerPubkey: string) => void
  syntheticParams: SyntheticParams | null
  setSyntheticParams: (syntheticParams: SyntheticParams) => void
}

export const useExpandableCardContent = (marketPubkey: string) => {
  const [offerPubkey, setOfferPubkey] = useState('')
  const [syntheticParams, setSyntheticParams] = useState<SyntheticParams | null>(null)

  const {
    tabs: bondTabs,
    value: tabValue,
    setValue: setTabValue,
  } = useTabs({ tabs: BONDS_TABS, defaultValue: DEFAULT_TAB })

  useEffect(() => {
    if (offerPubkey) {
      setTabValue(DEFAULT_TAB)
    }
  }, [offerPubkey, setTabValue])

  return {
    marketParams: {
      marketPubkey,
      offerPubkey,
      setOfferPubkey,
      syntheticParams,
      setSyntheticParams,
    },
    tabsParams: {
      tabs: bondTabs,
      value: tabValue,
      setValue: setTabValue,
    },
  }
}
