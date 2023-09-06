import { create } from 'zustand'

type SeatchSelectedMarketsState = {
  selectedMarkets: string[]
  setSelectedMarkets: (value: string[]) => void
}

export const useSearchSelectedMarkets = create<SeatchSelectedMarketsState>((set) => {
  const initialState: SeatchSelectedMarketsState = {
    selectedMarkets: [],
    setSelectedMarkets: (value) => {
      set(() => {
        return { selectedMarkets: value }
      })
    },
  }

  const queryParams = new URLSearchParams(window.location.search)
  const selectedMarketsParam = queryParams.get('collections')

  if (selectedMarketsParam) {
    const selectedMarkets = selectedMarketsParam.split(',')
    initialState.selectedMarkets = selectedMarkets
  }

  return initialState
})
