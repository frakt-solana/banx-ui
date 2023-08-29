import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { fetchUserOffers } from '@banx/api/core'

export const useUserOffers = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { data, isLoading } = useQuery(
    ['userOffers', publicKeyString],
    () => fetchUserOffers({ walletPublicKey: publicKeyString }),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  return {
    offers: data ?? [],
    loading: isLoading,
  }
}
