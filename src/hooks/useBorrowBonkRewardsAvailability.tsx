import { useQuery } from '@tanstack/react-query'

import { fetchBorrowBonkRewardsAvailability } from '@banx/api/activity'

export const useBorrowBonkRewardsAvailability = () => {
  const { data: bonkRewardsAvailable } = useQuery(
    ['borrowBonkRewardsAvailability'],
    () => fetchBorrowBonkRewardsAvailability(),
    {
      staleTime: 20 * 1000, //? 20 sec
      refetchInterval: 30 * 1000, //? 30 sec
      refetchOnWindowFocus: false,
    },
  )
  return bonkRewardsAvailable || false
}
