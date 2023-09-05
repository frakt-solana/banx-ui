import { create } from 'zustand'

import { useURLControl } from './helpers'

type MarketVisibilityStore = {
  visibleMarkets: string[]
  toggleMarketVisibility: (marketName: string) => void
}

const LOCAL_STORAGE_KEY = '@frakt.visibleMarkets'

const useMarketVisibilityStore = create<MarketVisibilityStore>((set) => {
  const getUpdatedMarkets = (state: MarketVisibilityStore, marketName: string) => {
    const isMarketVisible = state.visibleMarkets.includes(marketName)
    const updatedMarkets = isMarketVisible
      ? state.visibleMarkets.filter((name) => name !== marketName)
      : [...state.visibleMarkets, marketName]

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ visibleMarkets: updatedMarkets }))

    return { visibleMarkets: updatedMarkets }
  }

  const initialState: MarketVisibilityStore = {
    visibleMarkets: [],
    toggleMarketVisibility: (marketName) => set((state) => getUpdatedMarkets(state, marketName)),
  }

  const savedState = localStorage.getItem(LOCAL_STORAGE_KEY)

  if (savedState) {
    try {
      const parsedState = JSON.parse(savedState)
      initialState.visibleMarkets = parsedState.visibleMarkets || []
    } catch (error) {
      console.error('Error parsing saved state:', error)
    }
  }

  return initialState
})

export const useMarketURLControl = () => {
  const { visibleMarkets, toggleMarketVisibility } = useMarketVisibilityStore()

  useURLControl({ key: 'visibleMarkets', data: visibleMarkets, storageKey: LOCAL_STORAGE_KEY })

  return { visibleMarkets, toggleMarketVisibility }
}
