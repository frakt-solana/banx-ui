import { useEffect } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'
import { create } from 'zustand'

type SelectedMarketsStore = {
  selectedMarkets: string[]
  setSelectedMarkets: (value: string[]) => void
}

const LOCAL_STORAGE_KEY = '@frakt.selectedMarketsState'

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
  const navigate = useNavigate()
  const location = useLocation()

  const { selectedMarkets, setSelectedMarkets } = useSelectedMarkets()

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    queryParams.delete('selectedMarkets')

    if (selectedMarkets.length > 0) {
      queryParams.append('selectedMarkets', selectedMarkets.join(','))
    }

    navigate({ search: queryParams.toString() })

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ selectedMarkets }))
  }, [selectedMarkets, navigate, location.search])

  return { selectedMarkets, setSelectedMarkets }
}
