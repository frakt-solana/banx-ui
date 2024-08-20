import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { BN } from 'fbonds-core'

import { staking } from '@banx/api/common'
import { BANX_TOKEN_APPROX_CIRCULATING_AMOUNT } from '@banx/constants'
import { queryClient } from '@banx/providers'

import { mergeBanxSettings, mergeWithBanxStakingInfo } from './optimistics'

const createBanxStakeInfoQueryKey = (walletPubkey: string) => ['fetchBanxStakeInfo', walletPubkey]
const setBanxStakeInfoOptimistic = (
  walletPubkey: string,
  stateToMerge: Partial<{
    banxTokenStakes: staking.BanxTokenStake[]
    banxWalletBalances: BN[]
    banxAdventures: staking.BanxAdventure[]
    banxAdventureSubscriptions: staking.BanxAdventureSubscription[]
    banxStakes: staking.BanxStake[]
  }>,
) =>
  queryClient.setQueryData(
    createBanxStakeInfoQueryKey(walletPubkey),
    (queryData: staking.BanxStakingInfo | undefined) => {
      if (!queryData) return queryData

      return mergeWithBanxStakingInfo(queryData, stateToMerge)
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
const setBanxStakeSettingsOptimistic = (nextBanxStakingSettings: staking.BanxStakingSettings[]) =>
  queryClient.setQueryData(
    createBanxStakeSettingsQueryKey(),
    (queryData: staking.BanxStakingSettings | undefined) => {
      if (!queryData) return queryData

      return mergeBanxSettings(queryData, nextBanxStakingSettings || [])
    },
  )

export const useBanxStakeSettings = () => {
  const {
    data: banxStakeSettings,
    isLoading,
    refetch,
  } = useQuery(createBanxStakeSettingsQueryKey(), () => staking.fetchBanxStakeSettings(), {
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
