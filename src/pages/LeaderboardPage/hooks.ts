import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { SeasonUserRewards, fetchSeasonUserRewards } from '@banx/api/user'
import { queryClient } from '@banx/utils'

const USE_SEASON_USER_REWARDS_QUERY_KEY = 'seasonUserRewards'
const createSeasonUserRewardsQueryKey = (walletPubkey: string) => [
  USE_SEASON_USER_REWARDS_QUERY_KEY,
  walletPubkey,
]
export const useSeasonUserRewards = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { data, isLoading } = useQuery(
    createSeasonUserRewardsQueryKey(publicKeyString),
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
//? Optimistic based on queryData modification
export const updateBonkWithdrawOptimistic = (walletPubkey: string) =>
  queryClient.setQueryData(
    createSeasonUserRewardsQueryKey(walletPubkey),
    (queryData: SeasonUserRewards | undefined) => {
      if (!queryData) return queryData
      const { available = 0, redeemed = 0, totalAccumulated = 0 } = queryData?.bonkRewards || {}

      return {
        ...queryData,
        bonkRewards: {
          totalAccumulated,
          available: 0,
          redeemed: redeemed + available,
        },
      }
    },
  )
