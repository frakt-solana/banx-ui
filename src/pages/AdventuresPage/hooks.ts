import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import {
  BanxInfoBN,
  BanxStakingSettings,
  fetchBanxStakeInfo,
  fetchBanxStakeSettings,
  fetchBanxTokenCirculatingAmount,
} from '@banx/api/staking'
import { BANX_TOKEN_APPROX_CIRCULATING_AMOUNT } from '@banx/constants'
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

export const useBanxTokenCirculatingAmount = () => {
  const { data: amount, isLoading } = useQuery(
    ['banxTokenCirculatingAmount'],
    () => fetchBanxTokenCirculatingAmount(),
    {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    },
  )

  return {
    amount: amount ?? BANX_TOKEN_APPROX_CIRCULATING_AMOUNT,
    isLoading,
  }
}
