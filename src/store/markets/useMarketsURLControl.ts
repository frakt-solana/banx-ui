import { useEffect } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'

import { useMarketVisibility } from './useMarketVisibilityState'
import { useSearchSelectedMarkets } from './useSearchMarketsURLControl'

export const useMarketsURLControl = (shouldControlQueryParams?: boolean) => {
  const navigate = useNavigate()
  const location = useLocation()

  const { visibleMarkets, toggleMarketVisibility } = useMarketVisibility()
  const { selectedMarkets, setSelectedMarkets } = useSearchSelectedMarkets()

  useEffect(() => {
    //? Markets query parameters should only be on certain pages.
    if (shouldControlQueryParams) {
      const queryParams = new URLSearchParams(location.search)
      queryParams.delete('opened')
      queryParams.delete('collections')

      if (visibleMarkets.length > 0) {
        queryParams.append('opened', visibleMarkets.join(','))
      }

      if (selectedMarkets.length > 0) {
        queryParams.append('collections', selectedMarkets.join(','))
      }

      navigate({ search: queryParams.toString() })
    }
  }, [
    visibleMarkets,
    selectedMarkets,
    navigate,
    location.search,
    location.pathname,
    shouldControlQueryParams,
  ])

  return { visibleMarkets, toggleMarketVisibility, selectedMarkets, setSelectedMarkets }
}
