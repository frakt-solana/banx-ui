import { useQuery } from '@tanstack/react-query'
import { BN } from 'fbonds-core'
import { create } from 'zustand'

import { ClaimSource, SourcesBN, fetchUserRewards } from '@banx/api/user'

interface WalletModalState {
  visible: boolean
  setVisible: (nextValue: boolean) => void
  toggleVisibility: () => void
}

export const useWalletModal = create<WalletModalState>((set) => ({
  visible: false,
  toggleVisibility: () => set((state) => ({ ...state, visible: !state.visible })),
  setVisible: (nextValue) => set((state) => ({ ...state, visible: nextValue })),
}))

export const useFetchUserRewards = (walletPublicKey: string) => {
  const DEFAULT_RESPONSE: SourcesBN = [
    [ClaimSource.ATLAS, new BN(0)],
    [ClaimSource.FRKT_SWAPS, new BN(0)],
    [ClaimSource.LOCKED_FRKT, new BN(0)],
    [ClaimSource.BANX_SWAPS, new BN(0)],
    [ClaimSource.CATNIP, new BN(0)],
    [ClaimSource.LEADERBOARD, new BN(0)],
    [ClaimSource.COLLECTIONS, new BN(0)],
  ]

  const { data, isLoading, isFetching } = useQuery(
    ['userRewards', walletPublicKey],
    () => fetchUserRewards({ walletPubkey: walletPublicKey }),
    {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      enabled: !!walletPublicKey,
    },
  )

  return {
    data: data ?? { sources: DEFAULT_RESPONSE },
    loading: isLoading || isFetching,
  }
}
