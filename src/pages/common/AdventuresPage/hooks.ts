import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'

import { staking } from '@banx/api/common'
import { BANX_TOKEN_APPROX_CIRCULATING_AMOUNT } from '@banx/constants'
import { queryClient } from '@banx/providers'

const createBanxStakeInfoQueryKey = (walletPubkey: string) => ['fetchBanxStakeInfo', walletPubkey]
const setBanxStakeInfoOptimistic = (walletPubkey: string, nextState: staking.BanxStakingInfo) =>
  queryClient.setQueryData(
    createBanxStakeInfoQueryKey(walletPubkey),
    (queryData: staking.BanxStakingInfo | undefined) => {
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
    () => staking.fetchBanxStakeInfo({ userPubkey: walletPubkey }),
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
const setBanxStakeSettingsOptimistic = (nextState: staking.BanxStakingSettings) =>
  queryClient.setQueryData(
    createBanxStakeSettingsQueryKey(),
    (queryData: staking.BanxStakingSettings | undefined) => {
      if (!queryData) return queryData
      return nextState
    },
  )

export const useBanxStakeSettings = () => {
  const {
    data: banxStakeSettings,
    isLoading,
    refetch,
  } = useQuery(createBanxStakeSettingsQueryKey(), () => staking.fetchBanxStakeSettings(), {
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
    () => staking.fetchBanxTokenCirculatingAmount(),
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
