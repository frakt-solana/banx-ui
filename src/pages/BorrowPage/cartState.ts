import produce from 'immer'
import { cloneDeep, groupBy } from 'lodash'
import { create } from 'zustand'

import { BorrowNft } from '@banx/api/core'

import { SimpleOffer, SimpleOffersByMarket } from './types'

interface CartState {
  offerByMint: Record<string, SimpleOffer>
  offersByMarket: SimpleOffersByMarket

  addNft: (props: { mint: string; offer: SimpleOffer }) => void
  removeNft: (props: { mint: string }) => void

  findOfferInCart: (props: { mint: string }) => SimpleOffer | null
  findBestOffer: (props: { marketPubkey: string }) => SimpleOffer | null

  addNftsAuto: (nfts: BorrowNft[]) => void

  setCart: (props: { offersByMarket: SimpleOffersByMarket }) => void
  resetCart: () => void
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

        const { hadoMarket: marketPubkey } = offerInCart

        delete state.offerByMint[mint]

        //? Find worstOffer with same market. If order of removable nft is better, then swap is needed
        const allOffers = Object.values(state.offerByMint).flat()
        const allOffersWithSameMarketSorted = allOffers
          .filter((offer) => offer.hadoMarket === marketPubkey)
          .sort(simpleOffersSorter)
        const worstOfferWithSameMarket = allOffersWithSameMarketSorted.at(-1)

        if (
          worstOfferWithSameMarket &&
          offerInCart.loanValue > worstOfferWithSameMarket.loanValue
        ) {
          //? set removable order
          const nftMintWithWorstOffer =
            Object.entries(state.offerByMint).find(
              ([, offer]) => offer.publicKey === worstOfferWithSameMarket.publicKey,
            )?.[0] || ''

          state.offerByMint[nftMintWithWorstOffer] = offerInCart

          //? Put worst order back to offersByMarket
          state.offersByMarket = {
            ...state.offersByMarket,
            [marketPubkey]: [...state.offersByMarket[marketPubkey], worstOfferWithSameMarket].sort(
              simpleOffersSorter,
            ),
          }
        } else {
          //? Put offer from CartNft back to offersByMarket
          state.offersByMarket = {
            ...state.offersByMarket,
            [marketPubkey]: [...state.offersByMarket[marketPubkey], offerInCart].sort(
              simpleOffersSorter,
            ),
          }
        }
      }),
    )
  },

  addNftsAuto: (nfts) => {
    const { resetCart } = get()
    resetCart()
    set(
      produce((state: CartState) => {
        const nftsByMarket = groupBy(nfts, ({ loan }) => loan.marketPubkey)

        const offersByMarketSnapshot = cloneDeep(state.offersByMarket) || {}

        const offerByMint = Object.fromEntries(
          Object.entries(nftsByMarket)
            .map(([marketPubkey, nfts]) => {
              const offers = offersByMarketSnapshot[marketPubkey] || []
              const mintAddOfferArr: Array<[string, SimpleOffer]> = []
              for (let i = 0; i < Math.min(offers.length, nfts.length); ++i) {
                const nft = nfts[i]
                const offer = offers[i]
                if (nft && offer) {
                  mintAddOfferArr.push([nft.mint, offer])
                  state.offersByMarket[marketPubkey] = state.offersByMarket[marketPubkey].filter(
                    ({ publicKey }) => publicKey !== offer.publicKey,
                  )
                }
              }
              return mintAddOfferArr
            })
            .flat(),
        )

        state.offerByMint = offerByMint
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
  resetCart: () =>
    set(
      produce((state: CartState) => {
        const offersInUse = Object.values(state.offerByMint)

        const offersAvailable = Object.values(state.offersByMarket).flat()
        const offers = [...offersInUse, ...offersAvailable]

        const offersByMarket = Object.fromEntries(
          Object.entries(groupBy(offers, ({ hadoMarket }) => hadoMarket)).map(
            ([marketPubkey, offers]) => [marketPubkey, [...offers].sort(simpleOffersSorter)],
          ),
        )

        state.offerByMint = {}
        state.offersByMarket = offersByMarket
      }),
    ),
}))

const simpleOffersSorter = (a: SimpleOffer, b: SimpleOffer) => b.loanValue - a.loanValue
