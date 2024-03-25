import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { fetchTokenStakeInfo } from '@banx/api/banxTokenStake'

export const useBanxTokenStake = () => {
  const { publicKey } = useWallet()

  const {
    data: banxStake,
    isLoading,
    refetch,
  } = useQuery(
    ['tokenStakeInfo', publicKey?.toBase58()],
    () => fetchTokenStakeInfo({ userPubkey: publicKey?.toBase58() }),
    {
      staleTime: 60_000,
      // refetchInterval: 5_000,
      refetchOnWindowFocus: false,
    },
  )

  return {
    banxStake,
    isLoading,
    refetch,
  }
}
