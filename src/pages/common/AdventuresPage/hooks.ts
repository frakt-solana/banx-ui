import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { BN } from 'fbonds-core'
import { BanxStakeState } from 'fbonds-core/lib/fbond-protocol/types'

import { staking } from '@banx/api/common'
import { BANX_TOKEN_APPROX_CIRCULATING_AMOUNT } from '@banx/constants'
import { queryClient } from '@banx/providers'

const createBanxStakeInfoQueryKey = (walletPubkey: string) => ['fetchBanxStakeInfo', walletPubkey]
const setBanxStakeInfoOptimistic = (
  walletPubkey: string,
  stateToMerge: Partial<{
    banxTokenStake: staking.BanxTokenStake
    banxWalletBalance: BN
    banxAdventuresWithSubscription: staking.BanxAdventuresWithSubscription[]
    banxStake: staking.BanxStake
  }>,
) =>
  queryClient.setQueryData(
    createBanxStakeInfoQueryKey(walletPubkey),
    (queryData: staking.BanxStakingInfo | undefined) => {
      if (!queryData) return queryData

      return {
        ...queryData,
        banxTokenStake: stateToMerge.banxTokenStake ?? queryData.banxTokenStake,
        banxWalletBalance: stateToMerge.banxWalletBalance ?? queryData.banxWalletBalance,
        banxAdventures: stateToMerge.banxAdventuresWithSubscription
          ? mergeBanxAdventuresWithSubscription(
              queryData.banxAdventures,
              stateToMerge.banxAdventuresWithSubscription,
            )
          : queryData.banxAdventures,
        nfts:
          stateToMerge.banxStake && queryData.nfts
            ? mergeBanxNftStake(queryData.nfts, stateToMerge.banxStake)
            : queryData.nfts,
      }
    },
  )
const mergeBanxAdventuresWithSubscription = (
  prevState: staking.BanxAdventuresWithSubscription[],
  newAdventures: staking.BanxAdventuresWithSubscription[],
): staking.BanxAdventuresWithSubscription[] => {
  return prevState.map((adventure) => {
    const prevAdventurePubKey = adventure.adventure.publicKey
    const sameNewAdventure = newAdventures.find(
      ({ adventure: { publicKey } }) => publicKey === prevAdventurePubKey,
    )
    return sameNewAdventure ?? adventure
  })
}
const mergeBanxNftStake = (
  prevState: staking.BanxNftStake[],
  newStake: staking.BanxStake,
): staking.BanxNftStake[] => {
  const isNewStakeActive = newStake.banxStakeState === BanxStakeState.Staked

  return prevState.map((nft) => {
    if (nft.mint === newStake.nftMint) {
      return { ...nft, stake: isNewStakeActive ? newStake : undefined }
    }
    return nft
  })
}

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
