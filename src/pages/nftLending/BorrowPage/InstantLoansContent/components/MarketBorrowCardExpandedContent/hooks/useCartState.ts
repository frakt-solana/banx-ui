import produce from 'immer'
import { chain, isEmpty } from 'lodash'
import { create } from 'zustand'

import { SimpleOffer } from '@banx/utils'

export type CartState = {
  //? What in cart
  offerByMintInCart: Record<string, SimpleOffer>
  //? Available offers. When user adds nft, it goes to offerByMint and pop from availableOffers ( push/pop)
  availableOffers: SimpleOffer[]

  addNft: (props: { mint: string }) => void
  addNfts: (props: { mints: string[] }) => void
  removeNft: (props: { mint: string }) => void

  findOfferInCart: (props: { mint: string }) => SimpleOffer | null
  findBestAvailableOffer: () => SimpleOffer | null

  setCart: (props: { offers: SimpleOffer[] }) => void
  resetCart: () => void
}

const offersSorter = (a: SimpleOffer, b: SimpleOffer) => b.loanValue - a.loanValue

export const useCartState = create<CartState>((set, get) => ({
  offerByMintInCart: {},
  availableOffers: [],

  findOfferInCart: ({ mint }) => {
    return get().offerByMintInCart[mint] ?? null
  },

  findBestAvailableOffer: () => {
    return get().availableOffers?.at(0) ?? null
  },

  addNft: ({ mint }) => {
    set(
      produce((state: CartState) => {
        //? Ignore if nft is already in cart
        if (state.findOfferInCart({ mint })) return

        const bestAvailableOffer = state.findBestAvailableOffer()
        //? Ignore if offer wasn't found
        if (!bestAvailableOffer) return

        state.offerByMintInCart[mint] = bestAvailableOffer

        //? Remove offer from availableOffers
        state.availableOffers = state.availableOffers.filter(
          ({ id }) => id !== bestAvailableOffer.id,
        )
      }),
    )
  },

  addNfts: ({ mints }) => {
    if (!isEmpty(get().offerByMintInCart) || mints.length === 0) {
      get().resetCart()
    }

    mints.forEach((mint) => get().addNft({ mint }))
  },

  removeNft: ({ mint }) => {
    set(
      produce((state: CartState) => {
        const offerInCart = state.findOfferInCart({ mint })
        if (!offerInCart) return

        const { hadoMarket: marketPubkey } = offerInCart

        delete state.offerByMintInCart[mint]

        //? Find nft in cart with worstOffer. If offer of removable nft is better --> swap
        const allOffersInCartSorted = chain(state.offerByMintInCart)
          .values()
          .flatten()
          .filter((offer) => offer.hadoMarket === marketPubkey)
          .sort(offersSorter)
          .value()
        const worstOfferWithSameMarket = allOffersInCartSorted.at(-1)

        if (
          worstOfferWithSameMarket &&
          offerInCart.loanValue > worstOfferWithSameMarket.loanValue
        ) {
          //? find nft mint with worst offer
          const nftMintWithWorstOffer =
            Object.entries(state.offerByMintInCart).find(
              ([, offer]) =>
                offer.publicKey === worstOfferWithSameMarket.publicKey &&
                offer.id === worstOfferWithSameMarket.id,
            )?.[0] || ''

          //? swap worst offer with removable offer
          state.offerByMintInCart[nftMintWithWorstOffer] = offerInCart

          //? Put worst offer back to availableOffers
          state.availableOffers = [...state.availableOffers, worstOfferWithSameMarket].sort(
            offersSorter,
          )
        } else {
          //? Put offer from cart back to availableOffers
          state.availableOffers = [...state.availableOffers, offerInCart].sort(offersSorter)
        }
      }),
    )
  },

  setCart: ({ offers }) => {
    set(
      produce((state: CartState) => {
        state.offerByMintInCart = {}
        state.availableOffers = offers
      }),
    )
  },
  resetCart: () =>
    set(
      produce((state: CartState) => {
        const offersInUse = Object.values(state.offerByMintInCart)
        state.availableOffers = [...state.availableOffers, ...offersInUse].sort(offersSorter)
        state.offerByMintInCart = {}
      }),
    ),
}))
