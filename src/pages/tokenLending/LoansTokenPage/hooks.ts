import { create } from 'zustand'

import { LoansTokenTabsName } from './LoansTokenPage'

type LoansTokenTabsState = {
  tab: LoansTokenTabsName | null
  setTab: (tab: LoansTokenTabsName | null) => void
}

export const useLoansTokenTabs = create<LoansTokenTabsState>((set) => ({
  tab: null,
  setTab: (tab) => set({ tab }),
}))
