import produce from 'immer'
import { create } from 'zustand'

import { SimpleOffer, SimpleOffersByMarket } from './types'

interface CartState {
  offerByMint: Record<string, SimpleOffer>
  offersByMarket: SimpleOffersByMarket

  addNft: (props: { mint: string; offer: SimpleOffer }) => void
  removeNft: (props: { mint: string }) => void

  findOfferInCart: (props: { mint: string }) => SimpleOffer | null
  findBestOffer: (props: { marketPubkey: string }) => SimpleOffer | null

  setCart: (props: { offersByMarket: SimpleOffersByMarket }) => void
  clearCart: () => void
}

export const useCartState = create<CartState>((set, get) => ({
  offerByMint: {},
  offersByMarket: {},

  findOfferInCart: ({ mint }) => {
    return get().offerByMint[mint] ?? null
  },

  findBestOffer: ({ marketPubkey }) => {
    return get().offersByMarket[marketPubkey]?.at(0) ?? null
  },

  addNft: ({ mint, offer }) => {
    if (get().findOfferInCart({ mint })) return

    set(
      produce((state: CartState) => {
        state.offerByMint[mint] = offer

        //? Remove offer from offersByMarket

        const { hadoMarket: marketPubkey } = offer
        state.offersByMarket = {
          ...state.offersByMarket,
          [marketPubkey]: state.offersByMarket[marketPubkey].filter(({ id }) => id !== offer.id),
        }
      }),
    )
  },

  removeNft: ({ mint }) => {
    set(
      produce((state: CartState) => {
        const offerInCart = state.findOfferInCart({ mint })

        if (!offerInCart) return

        delete state.offerByMint[mint]

        //? Put offer from CartNft back to offersByMarket
        const { hadoMarket: marketPubkey } = offerInCart
        state.offersByMarket = {
          ...state.offersByMarket,
          [marketPubkey]: [...state.offersByMarket[marketPubkey], offerInCart].sort((a, b) => {
            return b.loanValue - a.loanValue
          }),
        }
      }),
    )
  },

  setCart: ({ offersByMarket }) => {
    set(
      produce((state: CartState) => {
        state.offerByMint = {}
        state.offersByMarket = offersByMarket
      }),
    )
  },
  clearCart: () =>
    set(
      produce((state: CartState) => {
        state.offerByMint = {}
        state.offersByMarket = {}
      }),
    ),
}))
