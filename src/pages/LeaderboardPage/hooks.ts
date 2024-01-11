import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { fetchLeaderboardUsersStats, fetchSeasonUserRewards } from '@banx/api/user'

export const useSeasonUserRewards = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { data, isLoading } = useQuery(
    ['seasonUserRewards', publicKeyString],
    () => fetchSeasonUserRewards({ walletPubkey: publicKeyString }),
    {
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, //? 30 seconds
    },
  )

  return {
    data,
    isLoading,
  }
}

export const useLeaderboardUserStats = () => {
  const { data, isLoading } = useQuery(
    ['leaderboardUserStats'],
    () => fetchLeaderboardUsersStats(),
    {
      refetchOnWindowFocus: false,
      staleTime: 30 * 60 * 1000, //? 30 mins
    },
  )

  return {
    data,
    isLoading,
  }
}
