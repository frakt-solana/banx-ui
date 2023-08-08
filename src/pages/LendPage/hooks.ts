import { useQuery } from '@tanstack/react-query'

import { MarketPreview, fetchMarketsPreview } from '@banx/api/bonds'

type UseMarketsPreview = () => {
  marketsPreview: MarketPreview[]
  isLoading: boolean
}

export const useMarketsPreview: UseMarketsPreview = () => {
  const { data, isLoading } = useQuery(['marketsPreview'], () => fetchMarketsPreview(), {
    staleTime: 5000,
    refetchOnWindowFocus: false,
  })

  return {
    marketsPreview: data || [],
    isLoading,
  }
}
