import { useQuery } from '@tanstack/react-query'
import { web3 } from 'fbonds-core'
import produce from 'immer'
import { create } from 'zustand'

import {
  FetchMarketOffers,
  MarketPreview,
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

interface HiddenOffersPubkeysState {
  hiddenOffersPubkeys: string[]
  hideOffer: (offerPubkey: string) => void
}
const useHiddenOffersPubkeys = create<HiddenOffersPubkeysState>((set) => ({
  hiddenOffersPubkeys: [],
  hideOffer: (offerPubkey) =>
    set(
      produce((state: HiddenOffersPubkeysState) => {
        state.hiddenOffersPubkeys = [...state.hiddenOffersPubkeys, offerPubkey]
      }),
    ),
}))

export const useMarketOffers = ({ marketPubkey }: { marketPubkey?: string }) => {
  const { hiddenOffersPubkeys, hideOffer } = useHiddenOffersPubkeys()

  const { data, isLoading, refetch } = useQuery(
    ['marketPairs', marketPubkey],
    () => FetchMarketOffers({ marketPubkey: new web3.PublicKey(marketPubkey as string) }),
    {
      enabled: !!marketPubkey,
      staleTime: 30 * 1000, //? 30sec
      refetchOnWindowFocus: false,
    },
  )

  return {
    offers: data?.filter(({ publicKey }) => !hiddenOffersPubkeys.includes(publicKey)) || [],
    isLoading,
    hideOffer,
    refetch,
  }
}
