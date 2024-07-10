import { useQuery } from '@tanstack/react-query'

import { MOCK_COLLATERALS_LIST } from '../../mockResponse'

export const useCollateralsList = () => {
  const { data, isLoading } = useQuery(
    ['collateralsList'],
    () => Promise.resolve(MOCK_COLLATERALS_LIST),
    {
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    },
  )

  return { collateralsList: data ?? [], isLoading }
}
