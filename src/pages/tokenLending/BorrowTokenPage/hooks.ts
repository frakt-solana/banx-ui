import { create } from 'zustand'

import { BorrowTokenTabName } from './BorrowTokenPage'

type BorrowTokenTabsState = {
  tab: BorrowTokenTabName | null
  setTab: (tab: BorrowTokenTabName | null) => void
}

export const useBorrowTokenTabs = create<BorrowTokenTabsState>((set) => ({
  tab: null,
  setTab: (tab) => set({ tab }),
}))
