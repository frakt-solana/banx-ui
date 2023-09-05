import { useEffect } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'
import { create } from 'zustand'

type SelectedMarketsStore = {
  selectedMarkets: string[]
  setSelectedMarkets: (value: string[]) => void
}

export const useSelectedMarkets = create<SelectedMarketsStore>((set) => {
  const initialState: SelectedMarketsStore = {
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

export const useSearchMarketsURLControl = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const { selectedMarkets, setSelectedMarkets } = useSelectedMarkets()

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    queryParams.delete('collections')

    if (selectedMarkets.length > 0) {
      queryParams.append('collections', selectedMarkets.join(','))
    }

    navigate({ search: queryParams.toString() })
  }, [selectedMarkets, navigate, location.search])

  return { selectedMarkets, setSelectedMarkets }
}
