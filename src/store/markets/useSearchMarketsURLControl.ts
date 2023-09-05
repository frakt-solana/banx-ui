import { create } from 'zustand'

import { useURLControl } from './helpers'

type SelectedMarketsStore = {
  selectedMarkets: string[]
  setSelectedMarkets: (value: string[]) => void
}

const LOCAL_STORAGE_KEY = '@frakt.selectedMarkets'

const useSelectedMarkets = create<SelectedMarketsStore>((set) => {
  const initialState: SelectedMarketsStore = {
    selectedMarkets: [],
    setSelectedMarkets: (value) => {
      set(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ selectedMarkets: value }))
        return { selectedMarkets: value }
      })
    },
  }

  const savedState = localStorage.getItem(LOCAL_STORAGE_KEY)

  if (savedState) {
    try {
      const parsedState = JSON.parse(savedState)
      initialState.selectedMarkets = parsedState.selectedMarkets || []
    } catch (error) {
      console.error('Error parsing saved state:', error)
    }
  }

  return initialState
})

export const useSearchMarketsURLControl = () => {
  const { selectedMarkets, setSelectedMarkets } = useSelectedMarkets()

  useURLControl({ key: 'collections', data: selectedMarkets, storageKey: LOCAL_STORAGE_KEY })

  return { selectedMarkets, setSelectedMarkets }
}
