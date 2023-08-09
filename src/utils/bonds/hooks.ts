import { useQuery } from '@tanstack/react-query'
import { web3 } from 'fbonds-core'
import produce from 'immer'
import { create } from 'zustand'

import { fetchAllMarkets, fetchCertainMarket, fetchMarketPairs } from '@banx/api/bonds'

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

interface HiddenPairsPubkeysState {
  hiddenPairsPubkeys: string[]
  hidePair: (pairPubkey: string) => void
}
const useHiddenPairsPubkeys = create<HiddenPairsPubkeysState>((set) => ({
  hiddenPairsPubkeys: [],
  hidePair: (pairPubkey) =>
    set(
      produce((state: HiddenPairsPubkeysState) => {
        state.hiddenPairsPubkeys = [...state.hiddenPairsPubkeys, pairPubkey]
      }),
    ),
}))

export const useMarketPairs = ({ marketPubkey }: { marketPubkey?: string }) => {
  const { hiddenPairsPubkeys, hidePair } = useHiddenPairsPubkeys()

  const { data, isLoading, refetch } = useQuery(
    ['marketPairs', marketPubkey],
    () => fetchMarketPairs({ marketPubkey: new web3.PublicKey(marketPubkey as string) }),
    {
      enabled: !!marketPubkey,
      staleTime: 30 * 1000, //? 30sec
      refetchOnWindowFocus: false,
    },
  )

  return {
    pairs: data?.filter(({ publicKey }) => !hiddenPairsPubkeys.includes(publicKey)) || [],
    isLoading,
    hidePair,
    refetch,
  }
}
