import { create } from 'zustand'

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
