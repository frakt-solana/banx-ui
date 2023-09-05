import { useEffect } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'
import { create } from 'zustand'

type MarketVisibilityStore = {
  visibleMarkets: string[]
  toggleMarketVisibility: (marketName: string) => void
}

const useMarketVisibilityStore = create<MarketVisibilityStore>((set) => {
  return {
    visibleMarkets: [],
    toggleMarketVisibility: (marketName) =>
      set((state) => {
        const isMarketVisible = state.visibleMarkets.includes(marketName)
        const updatedMarkets = isMarketVisible
          ? state.visibleMarkets.filter((name) => name !== marketName)
          : [...state.visibleMarkets, marketName]

        return { visibleMarkets: updatedMarkets }
      }),
  }
})

export const useMarketURLControl = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { visibleMarkets, toggleMarketVisibility } = useMarketVisibilityStore()

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)

    queryParams.delete('visibleMarkets')

    if (visibleMarkets.length > 0) {
      queryParams.append('visibleMarkets', visibleMarkets.join(','))
    }

    navigate({ search: queryParams.toString() })
  }, [visibleMarkets, navigate, location.search])

  return { visibleMarkets, toggleMarketVisibility }
}
