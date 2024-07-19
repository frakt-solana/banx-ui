import produce from 'immer'
import { create } from 'zustand'

import { coreNew } from '@banx/api/nft'

interface SelectedNFTsState {
  selection: coreNew.BorrowNft[]
  set: (selection: coreNew.BorrowNft[]) => void
  find: (mint: string) => coreNew.BorrowNft | null
  add: (nft: coreNew.BorrowNft) => void
  remove: (mint: string) => void
  toggle: (nft: coreNew.BorrowNft) => void
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
    return get().selection.find(({ nft }) => nft.mint.toBase58() === mint) ?? null
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
        state.selection = state.selection.filter(({ nft }) => nft.mint.toBase58() !== mint)
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
    const isNftInSelection = !!find(nft.mint.toBase58())

    isNftInSelection ? remove(nft.mint.toBase58()) : add(nft)
  },
}))
