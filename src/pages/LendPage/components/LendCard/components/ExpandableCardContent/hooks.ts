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
  pairPubkey: string
  syntheticParams: SyntheticParams | null
  setPairPubkey: (pairPubkey: string) => void
  setSyntheticParams: (params: SyntheticParams | null) => void
}

export const useOfferStore = create<OfferStore>((set) => ({
  pairPubkey: '',
  syntheticParams: null,
  setPairPubkey: (pairPubkey) => set({ pairPubkey }),
  setSyntheticParams: (params) => set({ syntheticParams: params }),
}))
