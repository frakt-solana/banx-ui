import { useQuery } from '@tanstack/react-query'

import {fetchBanxTokenSettings} from '@banx/api/banxTokenStake'

export const useBanxTokenSettings = () => {
  const {
    data: banxTokenSettings,
    isLoading,
    refetch,
  } = useQuery(
    ['banxTokenSettings'],
    () => fetchBanxTokenSettings(),
    {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  )

  return {
    banxTokenSettings,
    isLoading,
    refetch,
  }
}
