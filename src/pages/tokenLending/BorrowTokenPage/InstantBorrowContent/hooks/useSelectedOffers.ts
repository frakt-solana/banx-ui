import produce from 'immer'
import { create } from 'zustand'

import { BorrowOffer } from '@banx/api/tokens'

interface SelectedOffersState {
  selection: BorrowOffer[]
  set: (selection: BorrowOffer[]) => void
  find: (offerPubkey: string) => BorrowOffer | null
  add: (offer: BorrowOffer) => void
  remove: (offerPubkey: string) => void
  toggle: (offer: BorrowOffer) => void
  clear: () => void
}

export const useSelectedOffers = create<SelectedOffersState>((set, get) => ({
  selection: [],
  set: (selection) => {
    return set(
      produce((state: SelectedOffersState) => {
        state.selection = selection.map((offer) => offer)
      }),
    )
  },
  find: (offerPubkey) => {
    return get().selection.find((offer) => offer.publicKey === offerPubkey) ?? null
  },
  add: (offer) => {
    set(
      produce((state: SelectedOffersState) => {
        state.selection.push(offer)
      }),
    )
  },
  remove: (offerPubkey) => {
    set(
      produce((state: SelectedOffersState) => {
        state.selection = state.selection.filter((offer) => offer.publicKey !== offerPubkey)
      }),
    )
  },
  clear: () => {
    set(
      produce((state: SelectedOffersState) => {
        state.selection = []
      }),
    )
  },
  toggle: (offer) => {
    const { find, add, remove } = get()
    const isOfferInSelection = !!find(offer.publicKey)

    isOfferInSelection ? remove(offer.publicKey) : add(offer)
  },
}))
