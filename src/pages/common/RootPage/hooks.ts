import { useQuery } from '@tanstack/react-query'

import { stats } from '@banx/api/nft'

export const useAllUsdcTotalStats = () => {
  const { data, isLoading } = useQuery(
    ['allUsdcTotalStats'],
    () => stats.fetchAllTotalStats('allInUsdc'),
    {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  )

  return { data, isLoading }
}
