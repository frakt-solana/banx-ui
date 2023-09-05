import { useEffect } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'

import { PATHS } from '@banx/router'

import { useMarketVisibility } from './useMarketVisibilityState'
import { useSearchSelectedMarkets } from './useSearchMarketsURLControl'

export const useMarketsURLControl = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const { visibleMarkets, toggleMarketVisibility } = useMarketVisibility()
  const { selectedMarkets, setSelectedMarkets } = useSearchSelectedMarkets()

  useEffect(() => {
    if (location.pathname === PATHS.LEND) {
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
  }, [visibleMarkets, selectedMarkets, navigate, location.search, location.pathname])

  return { visibleMarkets, toggleMarketVisibility, selectedMarkets, setSelectedMarkets }
}
