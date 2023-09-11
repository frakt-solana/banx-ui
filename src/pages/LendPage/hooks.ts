import { useEffect, useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { web3 } from 'fbonds-core'
import { PairState } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, map, maxBy } from 'lodash'

import {
  MarketPreview,
  Offer,
  fetchCertainMarket,
  fetchMarketOffers,
  fetchMarketsPreview,
} from '@banx/api/core'
import { isOfferNewer, isOptimisticOfferExpired, useOffersOptimistic } from '@banx/store'

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

export const useMarketOffers = ({ marketPubkey }: { marketPubkey?: string }) => {
  const { optimisticOffers, update: updateOffer, remove: removeOffers } = useOffersOptimistic()

  const { data, isLoading, isFetching, isFetched } = useQuery(
    ['marketPairs', marketPubkey],
    () => fetchMarketOffers({ marketPubkey: new web3.PublicKey(marketPubkey as string) }),
    {
      enabled: !!marketPubkey,
      staleTime: 30 * 1000, //? 30sec
      refetchOnWindowFocus: false,
    },
  )

  //? Check expiredOffers and and purge them
  useEffect(() => {
    if (!data || isFetching || !isFetched) return

    const expiredOffersByTime = optimisticOffers.filter((offer) => isOptimisticOfferExpired(offer))

    const optimisticsToRemove = chain(optimisticOffers)
      .filter(({ offer }) => offer?.pairState !== PairState.PerpetualClosed)
      .filter(({ offer }) => {
        const sameOfferFromBE = data?.find(({ publicKey }) => publicKey === offer.publicKey)
        if (!sameOfferFromBE) return false
        const isBEOfferNewer = isOfferNewer(sameOfferFromBE, offer)
        return isBEOfferNewer
      })
      .value()

    if (optimisticsToRemove.length || expiredOffersByTime.length) {
      removeOffers(
        map([...expiredOffersByTime, ...optimisticsToRemove], ({ offer }) => offer.publicKey),
      )
    }
  }, [data, isFetched, isFetching, optimisticOffers, removeOffers])

  const offers = useMemo(() => {
    const filteredOptimisticOffers = optimisticOffers
      .filter(({ offer }) => offer.hadoMarket === marketPubkey)
      .map(({ offer }) => offer)

    const combinedOffers = [...filteredOptimisticOffers, ...(data ?? [])]

    return chain(combinedOffers)
      .groupBy('publicKey')
      .map((offers) => maxBy(offers, 'lastTransactedAt'))
      .filter((offer) => offer?.pairState !== PairState.PerpetualClosed)
      .compact()
      .value()
  }, [optimisticOffers, data, marketPubkey])

  const updateOrAddOffer = (offer: Offer) => {
    updateOffer([offer])
  }

  return {
    offers,
    updateOrAddOffer,
    isLoading,
  }
}
