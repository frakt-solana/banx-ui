import { useQuery } from '@tanstack/react-query'
import { BN } from 'bn.js'

import { core } from '@banx/api/tokens'
import { useDebounceValue } from '@banx/hooks'
import { ZERO_BN } from '@banx/utils'

export const useBorrowSplTokenOffers = (props: {
  market: string
  outputToken: string
  type: 'input' | 'output'
  amount: string
}) => {
  const debouncedAmount = useDebounceValue(props.amount, 1000)

  const { data, isLoading } = useQuery(
    ['borrowSplTokenOffers', { ...props, amount: debouncedAmount }],
    () => core.fetchBorrowSplTokenOffers({ ...props, amount: debouncedAmount }),
    {
      staleTime: 15 * 1000,
      refetchOnWindowFocus: false,
      enabled: new BN(debouncedAmount, 'hex').gt(ZERO_BN) && !!props.market,
    },
  )

  return { data: data ?? [], isLoading }
}
