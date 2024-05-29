import { create } from 'zustand'

import { LendTokenTabName } from './LendTokenPage'

type LendTokenTabsState = {
  tab: LendTokenTabName | null
  setTab: (tab: LendTokenTabName | null) => void
}

export const useLendTokenTabs = create<LendTokenTabsState>((set) => ({
  tab: null,
  setTab: (tab) => set({ tab }),
}))
