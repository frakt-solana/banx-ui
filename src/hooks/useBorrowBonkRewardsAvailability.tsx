import { useQuery } from '@tanstack/react-query'

import { activity } from '@banx/api/nft'

export const useBorrowBonkRewardsAvailability = () => {
  const { data: bonkRewardsAvailable } = useQuery(
    ['borrowBonkRewardsAvailability'],
    () => activity.fetchBorrowBonkRewardsAvailability(),
    {
      staleTime: 20 * 1000, //? 20 sec
      refetchInterval: 30 * 1000, //? 30 sec
      refetchOnWindowFocus: false,
    },
  )
  return bonkRewardsAvailable || false
}
