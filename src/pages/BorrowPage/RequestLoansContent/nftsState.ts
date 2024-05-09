import produce from 'immer'
import { create } from 'zustand'

import { BorrowNft } from '@banx/api/core'

interface SelectedNFTsState {
  selection: BorrowNft[]
  set: (selection: BorrowNft[]) => void
  find: (mint: string) => BorrowNft | null
  add: (nft: BorrowNft) => void
  remove: (mint: string) => void
  toggle: (nft: BorrowNft) => void
  clear: () => void
}

export const useSelectedNfts = create<SelectedNFTsState>((set, get) => ({
  selection: [],
  set: (selection) => {
    return set(
      produce((state: SelectedNFTsState) => {
        state.selection = selection.map((nft) => nft)
      }),
    )
  },
  find: (mint) => {
    return get().selection.find(({ nft }) => nft.mint === mint) ?? null
  },
  add: (nft) => {
    set(
      produce((state: SelectedNFTsState) => {
        state.selection.push(nft)
      }),
    )
  },
  remove: (mint) => {
    set(
      produce((state: SelectedNFTsState) => {
        state.selection = state.selection.filter(({ nft }) => nft.mint !== mint)
      }),
    )
  },
  clear: () => {
    set(
      produce((state: SelectedNFTsState) => {
        state.selection = []
      }),
    )
  },
  toggle: (nft) => {
    const { find, add, remove } = get()
    const isNftInSelection = !!find(nft.mint)

    isNftInSelection ? remove(nft.mint) : add(nft)
  },
}))
