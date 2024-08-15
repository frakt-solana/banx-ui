import produce from 'immer'
import { create } from 'zustand'

import { Offer } from '@banx/api/nft'

export interface OfferOptimistic {
  offer: Offer
  wallet: string
}

const convertOfferToOptimistic = (offer: Offer, walletPublicKey: string) => {
  return {
    offer,
    wallet: walletPublicKey,
  }
}

interface SelectedOffersState {
  selection: OfferOptimistic[]
  set: (selection: Offer[], walletPublicKey: string) => void
  find: (offerPubkey: string, walletPublicKey: string) => OfferOptimistic | null
  add: (offer: Offer, walletPublicKey: string) => void
  remove: (offerPubkey: string, walletPublicKey: string) => void
  toggle: (offer: Offer, walletPublicKey: string) => void
  clear: () => void
}

export const useSelectedOffers = create<SelectedOffersState>((set, get) => ({
  selection: [],
  set: (selection, walletPublicKey) => {
    if (!walletPublicKey) return

    return set(
      produce((state: SelectedOffersState) => {
        state.selection = selection.map((offer) => convertOfferToOptimistic(offer, walletPublicKey))
      }),
    )
  },
  find: (offerPubkey, walletPublicKey) => {
    if (!walletPublicKey) return null

    return get().selection.find(({ offer }) => offer.publicKey === offerPubkey) ?? null
  },
  add: (offer, walletPublicKey) => {
    if (!walletPublicKey) return

    set(
      produce((state: SelectedOffersState) => {
        state.selection.push(convertOfferToOptimistic(offer, walletPublicKey))
      }),
    )
  },
  remove: (offerPubkey, walletPublicKey) => {
    if (!walletPublicKey) return

    set(
      produce((state: SelectedOffersState) => {
        state.selection = state.selection.filter(({ offer }) => offer.publicKey !== offerPubkey)
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
  toggle: (offer: Offer, walletPublicKey) => {
    if (!walletPublicKey) return

    const { find, add, remove } = get()
    const isOfferInSelection = !!find(offer.publicKey, walletPublicKey)

    isOfferInSelection ? remove(offer.publicKey, walletPublicKey) : add(offer, walletPublicKey)
  },
}))
