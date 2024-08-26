import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'
import produce from 'immer'
import { create } from 'zustand'

interface SelectedOfferState {
  selection: BondOfferV3 | null
  set: (selection: BondOfferV3) => void
  find: (offerPubkey: string) => BondOfferV3 | null
  add: (offer: BondOfferV3) => void
  remove: () => void
  toggle: (offer: BondOfferV3) => void
}

export const useSelectedOffer = create<SelectedOfferState>((set, get) => ({
  selection: null,
  set: (selection) => {
    set(
      produce((state: SelectedOfferState) => {
        state.selection = selection
      }),
    )
  },
  find: (offerPubkey) => {
    const selectedOffer = get().selection
    return selectedOffer && selectedOffer.publicKey.toBase58() === offerPubkey
      ? selectedOffer
      : null
  },
  add: (offer) => {
    set(
      produce((state: SelectedOfferState) => {
        state.selection = offer
      }),
    )
  },
  remove: () => {
    set(
      produce((state: SelectedOfferState) => {
        state.selection = null
      }),
    )
  },
  toggle: (offer) => {
    const { find, remove, add } = get()
    const isOfferSelected = !!find(offer.publicKey.toBase58())

    isOfferSelected ? remove() : add(offer)
  },
}))
