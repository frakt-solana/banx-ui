import produce from 'immer'
import { create } from 'zustand'

interface HiddenNftsMintsState {
  mints: string[]
  addMints: (...mints: string[]) => void
}

export const useHiddenNftsMints = create<HiddenNftsMintsState>((set) => ({
  mints: [],
  addMints: (...mints) =>
    set(
      produce((state: HiddenNftsMintsState) => {
        state.mints.push(...mints)
      }),
    ),
}))
