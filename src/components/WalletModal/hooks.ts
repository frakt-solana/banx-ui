import { useQuery } from '@tanstack/react-query'
import { create } from 'zustand'

import { ClaimSource, SourcesNumber, fetchUserRewards } from '@banx/api/user'

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
  const DEFAULT_RESPONSE: SourcesNumber = [
    [ClaimSource.ATLAS, 0],
    [ClaimSource.BANX_SWAPS, 0],
    [ClaimSource.CATNIP, 0],
    [ClaimSource.COLLECTIONS, 0],
    [ClaimSource.LOCKED_FRKT, 0],
    [ClaimSource.LEADERBOARD, 0],
    [ClaimSource.FRKT_SWAPS, 0],
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
