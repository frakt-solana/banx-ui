import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { user } from '@banx/api/common'
import { queryClient } from '@banx/providers'

//? useSeasonUserRewards
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
    () => user.fetchSeasonUserRewards({ walletPubkey: publicKeyString }),
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
    (queryData: user.SeasonUserRewards | undefined) => {
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

export const updateBanxWithdrawOptimistic = (walletPubkey: string) =>
  queryClient.setQueryData(
    createSeasonUserRewardsQueryKey(walletPubkey),
    (queryData: user.SeasonUserRewards | undefined) => {
      if (!queryData) return queryData
      const { available = 0, redeemed = 0, totalAccumulated = 0 } = queryData?.banxRewards || {}

      return {
        ...queryData,
        banxRewards: {
          totalAccumulated,
          available: 0,
          redeemed: redeemed + available,
        },
      }
    },
  )
//? useSeasonUserRewards

//? useLinkedWallets
export const useLinkedWallets = () => {
  const { publicKey } = useWallet()

  const { data: linkedWallets, isLoading } = useQuery(
    createFetchLinkedWalletsQueryKey(publicKey?.toBase58() || ''),
    () => user.fetchLinkedWallets({ walletPublicKey: publicKey?.toBase58() || '' }),
    {
      enabled: !!publicKey?.toBase58(),
      staleTime: 5 * 1000,
    },
  )

  return {
    linkedWallets,
    isLoading,
    setLinkedWalletsOptimistic,
    removeLinkedWalletOptimistic,
  }
}

const USE_FETCH_LINKED_WALLETS_QUERY_KEY = 'fetchLinkedWallets'
const createFetchLinkedWalletsQueryKey = (walletPubkey: string) => [
  USE_FETCH_LINKED_WALLETS_QUERY_KEY,
  walletPubkey,
]
//? Optimistics based on queryData modification
const setLinkedWalletsOptimistic = (walletPubkey: string, nextState: user.LinkedWallet[]) =>
  queryClient.setQueryData(
    createFetchLinkedWalletsQueryKey(walletPubkey),
    (queryData: user.LinkedWallet[] | undefined) => {
      if (!queryData) return queryData
      return nextState
    },
  )
const removeLinkedWalletOptimistic = (walletPubkey: string, walletPubkeyToRemove: string) =>
  queryClient.setQueryData(
    createFetchLinkedWalletsQueryKey(walletPubkey),
    (queryData: user.LinkedWallet[] | undefined) => {
      if (!queryData) return queryData

      //? If we remove connected wallet
      if (walletPubkeyToRemove === walletPubkey) {
        const removableWallet = queryData.find(({ wallet }) => wallet === walletPubkeyToRemove)

        const nextState: user.LinkedWallet[] = removableWallet
          ? [{ ...removableWallet, type: 'main' }]
          : []

        return nextState
      }

      return queryData.filter(({ wallet }) => wallet !== walletPubkeyToRemove)
    },
  )
//? useLinkedWallets
