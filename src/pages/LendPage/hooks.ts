import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { web3 } from 'fbonds-core'
import { PairState } from 'fbonds-core/lib/fbond-protocol/types'
import { produce } from 'immer'
import { chain, maxBy } from 'lodash'
import { create } from 'zustand'

import {
  MarketPreview,
  Offer,
  fetchAllMarkets,
  fetchCertainMarket,
  fetchMarketOffers,
  fetchMarketsPreview,
} from '@banx/api/core'

type UseMarketsPreview = () => {
  marketsPreview: MarketPreview[]
  isLoading: boolean
}

export const useMarketsPreview: UseMarketsPreview = () => {
  const { data, isLoading } = useQuery(['marketsPreview'], () => fetchMarketsPreview(), {
    staleTime: 5000,
    refetchOnWindowFocus: false,
  })

  return {
    marketsPreview: data || [],
    isLoading,
  }
}

export const useMarket = ({ marketPubkey }: { marketPubkey: string }) => {
  const { data, isLoading } = useQuery(
    ['market', marketPubkey],
    () => fetchCertainMarket({ marketPubkey: new web3.PublicKey(marketPubkey) }),
    {
      enabled: !!marketPubkey,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  )

  return {
    market: data || null,
    isLoading,
  }
}

export const useMarkets = () => {
  const { data, isLoading } = useQuery(['markets'], () => fetchAllMarkets(), {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  return {
    markets: data || null,
    isLoading,
  }
}

interface OptimisticOfferStore {
  offers: Offer[]
  addOffer: (offer: Offer) => void
  findOffer: (offerPubkey: string) => Offer | null
  removeOffer: (offer: Offer) => void
  updateOffer: (offer: Offer) => void
}

const useOptimisticOfferStore = create<OptimisticOfferStore>((set, get) => ({
  offers: [],
  findOffer: (offerPubkey) => {
    const { offers } = get()
    return offers.find(({ publicKey }) => publicKey === offerPubkey) ?? null
  },
  addOffer: (offer) => {
    set(
      produce((state: OptimisticOfferStore) => {
        state.offers.push(offer)
      }),
    )
  },
  removeOffer: (offer) => {
    set(
      produce((state: OptimisticOfferStore) => {
        state.offers = state.offers.filter(({ publicKey }) => publicKey !== offer.publicKey)
      }),
    )
  },
  updateOffer: (offer: Offer) => {
    const { findOffer } = get()
    const offerExists = !!findOffer(offer.publicKey)

    offerExists &&
      set(
        produce((state: OptimisticOfferStore) => {
          state.offers = state.offers.map((existingOffer) =>
            existingOffer.publicKey === offer.publicKey ? offer : existingOffer,
          )
        }),
      )
  },
}))

export const useMarketOffers = ({ marketPubkey }: { marketPubkey?: string }) => {
  const { offers: optimisticOffers, addOffer, updateOffer, findOffer } = useOptimisticOfferStore()

  const { data, isLoading, refetch } = useQuery(
    ['marketPairs', marketPubkey],
    () => fetchMarketOffers({ marketPubkey: new web3.PublicKey(marketPubkey as string) }),
    {
      enabled: !!marketPubkey,
      staleTime: 30 * 1000, //? 30sec
      refetchOnWindowFocus: false,
    },
  )

  const offers = useMemo(() => {
    const combinedOffers = [...optimisticOffers, ...(data ?? [])]

    return chain(combinedOffers)
      .groupBy('publicKey')
      .map((offers) => maxBy(offers, 'lastTransactedAt'))
      .filter((offer) => offer?.pairState !== PairState.PerpetualClosed)
      .compact()
      .value()
  }, [optimisticOffers, data])

  const updateOrAddOffer = (offer: Offer) => {
    const offerExists = !!findOffer(offer.publicKey)

    return offerExists ? updateOffer(offer) : addOffer(offer)
  }

  return {
    offers,
    updateOrAddOffer,
    isLoading,
    refetch,
  }
}
