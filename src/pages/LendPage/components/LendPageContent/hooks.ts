import { useWallet } from '@solana/wallet-adapter-react'

import { useMarketsPreview } from '../../hooks'

export const useFilteredMarkets = () => {
  const { publicKey } = useWallet()

  const { marketsPreview, isLoading } = useMarketsPreview(publicKey as any)

  const showEmptyList = !isLoading && !marketsPreview?.length

  return {
    marketsPreview,
    isLoading,
    showEmptyList,
  }
}
