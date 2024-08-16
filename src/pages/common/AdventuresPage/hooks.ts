import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { BN } from 'fbonds-core'
import { reduce } from 'lodash'

import { staking } from '@banx/api/common'
import { BANX_TOKEN_APPROX_CIRCULATING_AMOUNT } from '@banx/constants'
import { queryClient } from '@banx/providers'
import { ZERO_BN } from '@banx/utils'

import { mergeWithBanxStakingInfo } from './mergeWithBanxStakingInfo'

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

const mergeBanxSettings = (
  banxSettings: staking.BanxStakingSettings,
  nextSettings: staking.BanxStakingSettings[],
): staking.BanxStakingSettings => {
  const {
    banxStaked: banxStakedDiff,
    rewardsHarvested: rewardsHarvestedDiff,
    tokensStaked: tokensStakedDiff,
  } = reduce(
    nextSettings,
    (diff, settings) => {
      return {
        banxStaked: diff.banxStaked.add(banxSettings.banxStaked.sub(settings.banxStaked)),
        rewardsHarvested: diff.rewardsHarvested.add(
          banxSettings.rewardsHarvested.sub(settings.rewardsHarvested),
        ),
        tokensStaked: diff.tokensStaked.add(banxSettings.tokensStaked.sub(settings.tokensStaked)),
      }
    },
    {
      banxStaked: ZERO_BN,
      rewardsHarvested: ZERO_BN,
      tokensStaked: ZERO_BN,
    },
  )

  return {
    ...nextSettings[0],
    banxStaked: banxSettings.banxStaked.sub(banxStakedDiff),
    rewardsHarvested: banxSettings.rewardsHarvested.sub(rewardsHarvestedDiff),
    tokensStaked: banxSettings.tokensStaked.sub(tokensStakedDiff),
  }
}

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
