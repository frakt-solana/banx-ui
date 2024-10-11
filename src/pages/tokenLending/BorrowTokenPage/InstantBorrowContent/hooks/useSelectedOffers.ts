import produce from 'immer'
import { create } from 'zustand'

import { BorrowOffer } from '@banx/api/tokens'

interface SelectedOffersState {
  selection: BorrowOffer[]
  set: (selection: BorrowOffer[]) => void
  find: (id: string) => BorrowOffer | null
  add: (offer: BorrowOffer) => void
  remove: (id: string) => void
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
  find: (offerId) => {
    return get().selection.find((offer) => offer.id === offerId) ?? null
  },
  add: (offer) => {
    set(
      produce((state: SelectedOffersState) => {
        state.selection.push(offer)
      }),
    )
  },
  remove: (offerId) => {
    set(
      produce((state: SelectedOffersState) => {
        state.selection = state.selection.filter((offer) => offer.id !== offerId)
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
    const isOfferInSelection = !!find(offer.id)

    isOfferInSelection ? remove(offer.id) : add(offer)
  },
}))
