import { useEffect, useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { web3 } from 'fbonds-core'
import { PairState } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, map, maxBy } from 'lodash'

import { Offer, fetchMarketOffers, fetchMarketsPreview } from '@banx/api/core'
import { isOfferNewer, isOptimisticOfferExpired, useOffersOptimistic, useToken } from '@banx/store'
import { isOfferClosed } from '@banx/utils'

export const USE_MARKETS_PREVIEW_QUERY_KEY = 'marketsPreview'

export const useMarketsPreview = () => {
  const { token: tokenType } = useToken()

  const { data, isLoading } = useQuery(
    [USE_MARKETS_PREVIEW_QUERY_KEY, tokenType],
    () => fetchMarketsPreview({ marketType: tokenType }),
    {
      staleTime: 5000,
      cacheTime: Infinity,
      refetchOnWindowFocus: false,
    },
  )

  return {
    marketsPreview: data || [],
    isLoading,
  }
}

export const useMarketOffers = ({ marketPubkey }: { marketPubkey?: string }) => {
  const { optimisticOffers, update: updateOffer, remove: removeOffers } = useOffersOptimistic()
  const { token: tokenType } = useToken()

  const { data, isLoading, isFetching, isFetched } = useQuery(
    ['marketPairs', marketPubkey, tokenType],
    () =>
      fetchMarketOffers({
        marketPubkey: new web3.PublicKey(marketPubkey as string),
        marketType: tokenType,
      }),
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
      .filter(({ offer }) => !isOfferClosed(offer?.pairState))
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
      .filter((offer) => !isOfferClosed(offer?.pairState || PairState.PerpetualClosed))
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
