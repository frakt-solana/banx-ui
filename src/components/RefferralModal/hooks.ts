import { useQuery } from '@tanstack/react-query'

import { user } from '@banx/api/common'

export const useGetUserWalletByRefCode = (refCode: string) => {
  const { data, isLoading } = useQuery(
    ['refPersonalData', refCode],
    () => user.fetchUserWalletByRefCode({ refCode }),
    {
      staleTime: 5000,
      refetchOnWindowFocus: false,
    },
  )

  return { data: data ?? '', isLoading }
}
