import { useEffect } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'
import { create } from 'zustand'

export const useMarketsURLControl = (shouldControlQueryParams?: boolean) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { selectedMarkets, setSelectedMarkets } = useSearchSelectedMarkets()

  useEffect(() => {
    //? Markets query parameters should only be on certain pages.
    if (shouldControlQueryParams) {
      const queryParams = new URLSearchParams(location.search)
      queryParams.delete('collections')

      if (selectedMarkets.length > 0) {
        queryParams.append('collections', selectedMarkets.join(','))
      }

      navigate({ search: queryParams.toString() }, { replace: true })
    }
  }, [navigate, selectedMarkets, location.search, location.pathname, shouldControlQueryParams])

  return {
    selectedMarkets,
    setSelectedMarkets,
  }
}

type SeatchSelectedMarketsState = {
  selectedMarkets: string[]
  setSelectedMarkets: (value: string[]) => void
}

const useSearchSelectedMarkets = create<SeatchSelectedMarketsState>((set) => {
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
