import { useQuery } from '@tanstack/react-query'
import { create } from 'zustand'

import { fetchUserRewards } from '@banx/api/user'

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
  const { data, isLoading, isFetching } = useQuery(
    ['fetchUserRewards', walletPublicKey],
    () => fetchUserRewards({ publicKey: walletPublicKey }),
    {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      enabled: !!walletPublicKey,
    },
  )

  return {
    data: data,
    loading: isLoading || isFetching,
  }
}
