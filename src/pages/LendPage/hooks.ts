import { useQuery } from '@tanstack/react-query'
import { web3 } from 'fbonds-core'
import { PairState } from 'fbonds-core/lib/fbond-protocol/types'
import { produce } from 'immer'
import { chain, maxBy } from 'lodash'
import { create } from 'zustand'

import {
  FetchMarketOffers,
  MarketPreview,
  Offer,
  fetchAllMarkets,
  fetchCertainMarket,
  fetchMarketsPreview,
} from '@banx/api/bonds'

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
  optimisticOffers: Offer[]
  addOptimisticOffer: (offer: Offer) => void
  findOptimisticOffer: (offerPubkey: string) => Offer | null
  removeOptimisticOffer: (offer: Offer) => void
  updateOrAddOptimisticOffer: (offer: Offer) => void
}

export const useOptimisticOfferStore = create<OptimisticOfferStore>((set, get) => ({
  optimisticOffers: [],
  findOptimisticOffer: (offerPubkey) => {
    const { optimisticOffers } = get()
    return optimisticOffers.find(({ publicKey }) => publicKey === offerPubkey) ?? null
  },
  addOptimisticOffer: (offer) => {
    set(
      produce((state: OptimisticOfferStore) => {
        state.optimisticOffers.push(offer)
      }),
    )
  },
  removeOptimisticOffer: (offer) => {
    set(
      produce((state: OptimisticOfferStore) => {
        state.optimisticOffers = state.optimisticOffers.filter(
          ({ publicKey }) => publicKey !== offer.publicKey,
        )
      }),
    )
  },
  updateOrAddOptimisticOffer: (offer: Offer) => {
    const { findOptimisticOffer, addOptimisticOffer } = get()

    const existingOffer = !!findOptimisticOffer(offer.publicKey)

    existingOffer
      ? set(
          produce((state: OptimisticOfferStore) => {
            state.optimisticOffers = state.optimisticOffers.map((existingOffer) =>
              existingOffer.publicKey === offer.publicKey ? offer : existingOffer,
            )
          }),
        )
      : addOptimisticOffer(offer)
  },
}))

export const useMarketOffers = ({ marketPubkey }: { marketPubkey?: string }) => {
  const { optimisticOffers, addOptimisticOffer } = useOptimisticOfferStore()

  const { data, isLoading, refetch } = useQuery(
    ['marketPairs', marketPubkey],
    () => FetchMarketOffers({ marketPubkey: new web3.PublicKey(marketPubkey as string) }),
    {
      enabled: !!marketPubkey,
      staleTime: 30 * 1000, //? 30sec
      refetchOnWindowFocus: false,
    },
  )

  const offers = chain([...optimisticOffers, ...(data || [])])
    .groupBy('publicKey')
    .map((offers) => maxBy(offers, 'lastTransactedAt'))
    .filter((offer) => offer?.pairState !== PairState.PerpetualClosed)
    .value()

  return {
    offers: offers as Offer[],
    addOptimisticOffer,
    isLoading,
    refetch,
  }
}
