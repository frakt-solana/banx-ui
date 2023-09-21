import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { fetchAdventuresInfo } from '@banx/api/adventures'

export const useAdventuresInfo = () => {
  const { publicKey } = useWallet()

  const {
    data: adventuresInfo,
    isLoading,
    refetch,
  } = useQuery(
    ['adventuresInfo', publicKey?.toBase58()],
    () => fetchAdventuresInfo({ publicKey: publicKey ?? undefined }),
    {
      staleTime: 60_000,
      refetchInterval: 5_000,
      refetchOnWindowFocus: false,
    },
  )

  return {
    adventuresInfo,
    isLoading,
    refetch,
  }
}
