import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import {
  BanxStake,
  BanxStakeSettings,
  fetchBanxTokenSettings,
  fetchTokenStakeInfo,
} from '@banx/api/banxTokenStake'
import { queryClient } from '@banx/utils'

const createBanxTokenStakeQueryKey = (walletPubkey: string) => ['fetchBanxTokenStake', walletPubkey]
const setBanxTokenStakeOptimistic = (walletPubkey: string, nextState: BanxStake) =>
  queryClient.setQueryData(
    createBanxTokenStakeQueryKey(walletPubkey),
    (queryData: BanxStake | undefined) => {
      if (!queryData) return queryData
      return nextState
    },
  )

export const useBanxTokenStake = () => {
  const { publicKey } = useWallet()
  const walletPubkey = publicKey?.toBase58() || ''

  const {
    data: banxStake,
    isLoading,
    refetch,
  } = useQuery(
    createBanxTokenStakeQueryKey(walletPubkey),
    () => fetchTokenStakeInfo({ userPubkey: walletPubkey }),
    {
      refetchInterval: 10_000,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  )

  return {
    banxStake,
    isLoading,
    refetch,
    setBanxTokenStakeOptimistic,
  }
}

const createBanxTokenSettingsQueryKey = () => ['fetchBanxTokenSettings']
const setBanxTokenSettingsOptimistic = (nextState: BanxStakeSettings) =>
  queryClient.setQueryData(
    createBanxTokenSettingsQueryKey(),
    (queryData: BanxStakeSettings | undefined) => {
      if (!queryData) return queryData
      return nextState
    },
  )

export const useBanxTokenSettings = () => {
  const {
    data: banxTokenSettings,
    isLoading,
    refetch,
  } = useQuery(createBanxTokenSettingsQueryKey(), () => fetchBanxTokenSettings(), {
    refetchInterval: 10_000,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  return {
    banxTokenSettings,
    setBanxTokenSettingsOptimistic,
    isLoading,
    refetch,
  }
}
