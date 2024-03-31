import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import {
  BanxInfoBN,
  BanxStakingSettings,
  fetchBanxStakeInfo,
  fetchBanxStakeSettings,
} from '@banx/api/staking'
import { queryClient } from '@banx/utils'

const createBanxStakeInfoQueryKey = (walletPubkey: string) => ['fetchBanxStakeInfo', walletPubkey]
const setBanxStakeInfoOptimistic = (walletPubkey: string, nextState: BanxInfoBN) =>
  queryClient.setQueryData(
    createBanxStakeInfoQueryKey(walletPubkey),
    (queryData: BanxInfoBN | undefined) => {
      if (!queryData) return queryData
      return nextState
    },
  )

export const useBanxStakeInfo = () => {
  const { publicKey } = useWallet()
  const walletPubkey = publicKey?.toBase58() || ''

  const {
    data: banxStakeInfo,
    isLoading,
    refetch,
  } = useQuery(
    createBanxStakeInfoQueryKey(walletPubkey),
    () => fetchBanxStakeInfo({ userPubkey: walletPubkey }),
    {
      refetchInterval: 10_000,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  )

  return {
    banxStakeInfo,
    isLoading,
    refetch,
    setOptimistic: setBanxStakeInfoOptimistic,
  }
}

const createBanxStakeSettingsQueryKey = () => ['fetchBanxStakeSettings']
const setBanxStakeSettingsOptimistic = (nextState: BanxStakingSettings) =>
  queryClient.setQueryData(
    createBanxStakeSettingsQueryKey(),
    (queryData: BanxStakingSettings | undefined) => {
      if (!queryData) return queryData
      return nextState
    },
  )

export const useBanxStakeSettings = () => {
  const {
    data: banxStakeSettings,
    isLoading,
    refetch,
  } = useQuery(createBanxStakeSettingsQueryKey(), () => fetchBanxStakeSettings(), {
    refetchInterval: 10_000,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  return {
    banxStakeSettings,
    setOptimistic: setBanxStakeSettingsOptimistic,
    isLoading,
    refetch,
  }
}
