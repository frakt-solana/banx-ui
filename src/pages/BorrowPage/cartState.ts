import produce from 'immer'
import { cloneDeep, groupBy, isEmpty } from 'lodash'
import { create } from 'zustand'

import { MintsByMarket, SimpleOffer, SimpleOffersByMarket } from './types'

export interface CartState {
  offerByMint: Record<string, SimpleOffer>
  offersByMarket: SimpleOffersByMarket

  addNft: (props: { mint: string; offer: SimpleOffer }) => void
  removeNft: (props: { mint: string }) => void

  findOfferInCart: (props: { mint: string }) => SimpleOffer | null
  findBestOffer: (props: { marketPubkey: string }) => SimpleOffer | null
  isNftInCart: (props: { mint: string }) => boolean

  addNftsAuto: (props: { mintsByMarket: MintsByMarket }) => void

  addNftsAmount: (props: { mintsByMarket: MintsByMarket; amount: number }) => void

  setCart: (props: { offersByMarket: SimpleOffersByMarket }) => void
  resetCart: () => void
}

const offersSorter = (a: SimpleOffer, b: SimpleOffer) => b.loanValue - a.loanValue

export const useCartState = create<CartState>((set, get) => ({
  offerByMint: {},
  offersByMarket: {},

  findOfferInCart: ({ mint }) => {
    return get().offerByMint[mint] ?? null
  },

  findBestOffer: ({ marketPubkey }) => {
    return get().offersByMarket[marketPubkey]?.at(0) ?? null
  },

  isNftInCart: ({ mint }) => {
    return !!Object.keys(get().offerByMint).find((nftMint) => nftMint === mint)
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
          .sort(offersSorter)
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
              offersSorter,
            ),
          }
        } else {
          //? Put offer from CartNft back to offersByMarket
          state.offersByMarket = {
            ...state.offersByMarket,
            [marketPubkey]: [...state.offersByMarket[marketPubkey], offerInCart].sort(offersSorter),
          }
        }
      }),
    )
  },

  addNftsAuto: ({ mintsByMarket }) => {
    const { resetCart } = get()
    resetCart()
    set(
      produce((state: CartState) => {
        const offersByMarketSnapshot = cloneDeep(state.offersByMarket) || {}

        const offerByMint = Object.fromEntries(
          Object.entries(mintsByMarket)
            .map(([marketPubkey, mints]) => {
              const offers = offersByMarketSnapshot[marketPubkey] || []
              const mintAddOfferArr: Array<[string, SimpleOffer]> = []
              for (let i = 0; i < Math.min(offers.length, mints.length); ++i) {
                const mint = mints[i]
                const offer = offers[i]
                if (mint && offer) {
                  mintAddOfferArr.push([mint, offer])
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

  addNftsAmount: ({ mintsByMarket, amount = 0 }) => {
    const { resetCart, offerByMint } = get()

    if (!isEmpty(offerByMint) || amount === 0) {
      resetCart()
    }
    set(
      produce((state: CartState) => {
        if (amount === 0) return

        const mintAndOffer = Object.entries(mintsByMarket)
          .map(([marketPubkey, mints]) => {
            const offers = state.offersByMarket[marketPubkey] || []
            const mintAddOffer: Array<[string, SimpleOffer]> = []
            for (let i = 0; i < Math.min(offers.length, mints.length); ++i) {
              const mint = mints[i]
              const offer = offers[i]
              if (mint && offer) {
                mintAddOffer.push([mint, offer])
              }
            }
            return mintAddOffer
          })
          .flat()
          .slice(0, amount)
          .sort(([, offerA], [, offerB]) => offerB.loanValue - offerA.loanValue)

        const nextOffersByMarket = Object.fromEntries(
          Object.entries(state.offersByMarket).map(([marketPubkey, offers]) => {
            return [
              marketPubkey,
              offers.filter((offer) => {
                const isOfferInUse = !!mintAndOffer.find(
                  ([, selectedOffer]) =>
                    selectedOffer.id === offer.id && selectedOffer.publicKey === offer.publicKey,
                )
                return !isOfferInUse
              }),
            ]
          }),
        )

        state.offersByMarket = nextOffersByMarket
        state.offerByMint = Object.fromEntries(mintAndOffer)
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
            ([marketPubkey, offers]) => [marketPubkey, [...offers].sort(offersSorter)],
          ),
        )

        state.offerByMint = {}
        state.offersByMarket = offersByMarket
      }),
    ),
}))
