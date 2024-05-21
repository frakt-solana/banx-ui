import { create } from 'zustand'

interface BurgerMenuState {
  isVisible: boolean
  toggleVisibility: () => void
  setVisibility: (nextValue: boolean) => void
}

export const useBurgerMenu = create<BurgerMenuState>((set) => ({
  isVisible: false,
  toggleVisibility: () => set((state) => ({ ...state, isVisible: !state.isVisible })),
  setVisibility: (nextValue) => set((state) => ({ ...state, isVisible: nextValue })),
}))
