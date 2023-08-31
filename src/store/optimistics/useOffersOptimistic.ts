import produce from 'immer'
import { create } from 'zustand'

import { Offer } from '@banx/api/core'

interface OptimisticOffersState {
  offers: Offer[]
  addOffer: (offer: Offer) => void
  findOffer: (offerPubkey: string) => Offer | null
  removeOffer: (offer: Offer) => void
  updateOffer: (offer: Offer) => void
}

export const useOffersOptimistic = create<OptimisticOffersState>((set, get) => ({
  offers: [],
  addOffer: (offer) => {
    set(
      produce((state: OptimisticOffersState) => {
        state.offers.push(offer)
      }),
    )
  },
  findOffer: (offerPubkey) => {
    const { offers } = get()
    return offers.find(({ publicKey }) => publicKey === offerPubkey) ?? null
  },
  removeOffer: (offer) => {
    set(
      produce((state: OptimisticOffersState) => {
        state.offers = state.offers.filter(({ publicKey }) => publicKey !== offer.publicKey)
      }),
    )
  },
  updateOffer: (offer: Offer) => {
    const { findOffer } = get()
    const offerExists = !!findOffer(offer.publicKey)

    offerExists &&
      set(
        produce((state: OptimisticOffersState) => {
          state.offers = state.offers.map((existingOffer) =>
            existingOffer.publicKey === offer.publicKey ? offer : existingOffer,
          )
        }),
      )
  },
}))
