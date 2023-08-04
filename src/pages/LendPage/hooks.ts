import { useQuery } from '@tanstack/react-query'
import { web3 } from 'fbonds-core'

import { MarketPreview, fetchMarketsPreview } from '@banx/api/bonds'

type UseMarketsPreview = (walletPubkey?: web3.PublicKey) => {
  marketsPreview: MarketPreview[]
  isLoading: boolean
}

export const useMarketsPreview: UseMarketsPreview = (walletPubkey) => {
  const { data, isLoading } = useQuery(
    ['marketsPreview', walletPubkey],
    () => fetchMarketsPreview({ walletPubkey }),
    {
      staleTime: 5000,
      refetchOnWindowFocus: false,
    },
  )

  return {
    marketsPreview: data || [],
    isLoading,
  }
}
