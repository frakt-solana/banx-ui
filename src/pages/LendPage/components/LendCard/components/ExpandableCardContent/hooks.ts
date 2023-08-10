import { create } from 'zustand'

import { useTabs } from '@banx/components/Tabs'

import { SyntheticParams } from '../OrderBook'
import { BONDS_TABS } from './constants'

export const useExpandableCardContent = () => {
  const {
    tabs: bondTabs,
    value: tabValue,
    setValue: setTabValue,
  } = useTabs({
    tabs: BONDS_TABS,
    defaultValue: BONDS_TABS[0].value,
  })

  return {
    tabsParams: {
      tabs: bondTabs,
      value: tabValue,
      setValue: setTabValue,
    },
  }
}

interface OfferStore {
  offerPubkey: string
  syntheticParams: SyntheticParams | null
  setOfferPubkey: (offerPubkey: string) => void
  setSyntheticParams: (params: SyntheticParams | null) => void
}

export const useOfferStore = create<OfferStore>((set) => ({
  offerPubkey: '',
  syntheticParams: null,
  setOfferPubkey: (offerPubkey) => set({ offerPubkey }),
  setSyntheticParams: (params) => set({ syntheticParams: params }),
}))
