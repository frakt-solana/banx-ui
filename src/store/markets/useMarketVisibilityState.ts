import { create } from 'zustand'

type MarketVisibilityState = {
  visibleMarkets: string[]
  toggleMarketVisibility: (marketName: string) => void
}

export const useMarketVisibility = create<MarketVisibilityState>((set) => {
  const getUpdatedMarkets = (state: MarketVisibilityState, marketName: string) => {
    const isMarketVisible = state.visibleMarkets.includes(marketName)
    const updatedMarkets = isMarketVisible
      ? state.visibleMarkets.filter((name) => name !== marketName)
      : [...state.visibleMarkets, marketName]

    return { visibleMarkets: updatedMarkets }
  }

  const initialState: MarketVisibilityState = {
    visibleMarkets: [],
    toggleMarketVisibility: (marketName) => set((state) => getUpdatedMarkets(state, marketName)),
  }

  const queryParams = new URLSearchParams(window.location.search)
  const visibleMarketsParam = queryParams.get('opened')

  if (visibleMarketsParam) {
    const visibleMarkets = visibleMarketsParam.split(',')
    initialState.visibleMarkets = visibleMarkets
  }

  return initialState
})
