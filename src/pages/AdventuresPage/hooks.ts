import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { web3 } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'

import {
  BanxStake,
  BanxStakeSettings,
  fetchBanxTokenSettings,
  fetchTokenStakeInfo,
} from '@banx/api/banxTokenStake'
import { queryClient } from '@banx/utils'

import { getTokenBalance } from './helpers'

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

export const useBanxTokenBalance = () => {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const walletPubkey = publicKey?.toBase58() || ''

  const fetchTokenBalance = () => {
    if (publicKey) {
      return getTokenBalance(publicKey, connection, new web3.PublicKey(BANX_TOKEN_MINT))
    }
    return '0'
  }

  const { data, isLoading, refetch } = useQuery(
    ['banxTokenBalance', walletPubkey],
    fetchTokenBalance,
    {
      refetchInterval: 10_000,
      cacheTime: 10_000,
    },
  )

  return {
    data: data ?? '0',
    isLoading,
    refetch,
  }
}
