import { useQuery } from '@tanstack/react-query'

import { fetchBanxStats } from '@banx/api/adventures'

export const useBanxStats = () => {
  const { data, isLoading } = useQuery(['banxStats'], () => fetchBanxStats(), {
    staleTime: 30 * 60 * 1000, // 30 mins
    refetchOnWindowFocus: false,
  })

  return {
    data,
    isLoading,
  }
}
