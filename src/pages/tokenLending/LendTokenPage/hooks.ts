import { useEffect, useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'
import { BondOfferV3, PairState } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, map, maxBy } from 'lodash'
import { create } from 'zustand'

import { core } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'
import {
  isOfferNewer,
  isOptimisticOfferExpired,
  useTokenOffersOptimistic,
} from '@banx/store/token/useTokenOffersOptimistic'
import { isOfferStateClosed } from '@banx/utils'

import { LendTokenTabName } from './LendTokenPage'

export const USE_TOKEN_MARKETS_PREVIEW_QUERY_KEY = 'tokenMarketsPreview'

export const useTokenMarketsPreview = () => {
  const { tokenType } = useNftTokenType()

  const { data, isLoading } = useQuery(
    [USE_TOKEN_MARKETS_PREVIEW_QUERY_KEY, tokenType],
    () => core.fetchTokenMarketsPreview({ tokenType }),
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

export const useTokenMarketOffers = (marketPubkey: string) => {
  const { optimisticOffers, update: updateOffer, remove: removeOffers } = useTokenOffersOptimistic()
  const { tokenType } = useNftTokenType()

  const { data, isLoading, isFetching, isFetched } = useQuery(
    ['marketTokenOffers', marketPubkey, tokenType],
    () => core.fetchTokenMarketOffers({ marketPubkey, tokenType }),
    {
      enabled: !!marketPubkey,
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
    },
  )

  //? Check expiredOffers and and purge them
  useEffect(() => {
    if (!data || isFetching || !isFetched) return

    const expiredOffersByTime = optimisticOffers.filter((offer) => isOptimisticOfferExpired(offer))

    const optimisticsToRemove = chain(optimisticOffers)
      .filter(({ offer }) => !isOfferStateClosed(offer?.pairState))
      .filter(({ offer }) => {
        const sameOfferFromBE = data?.find(
          ({ publicKey }) => publicKey.toBase58() === offer.publicKey.toBase58(),
        )
        if (!sameOfferFromBE) return false
        const isBEOfferNewer = isOfferNewer(sameOfferFromBE, offer)
        return isBEOfferNewer
      })
      .value()

    if (optimisticsToRemove.length || expiredOffersByTime.length) {
      removeOffers(
        map([...expiredOffersByTime, ...optimisticsToRemove], ({ offer }) =>
          offer.publicKey.toBase58(),
        ),
      )
    }
  }, [data, isFetched, isFetching, optimisticOffers, removeOffers])

  const offers = useMemo(() => {
    const filteredOptimisticOffers = optimisticOffers
      .filter(({ offer }) => offer.hadoMarket?.toBase58() === marketPubkey)
      .map(({ offer }) => offer)

    const combinedOffers = [...filteredOptimisticOffers, ...(data ?? [])]

    return chain(combinedOffers)
      .groupBy((offer) => offer.publicKey.toBase58())
      .map((offers) => maxBy(offers, (offer) => offer.lastTransactedAt.toNumber()))
      .filter((offer) => !isOfferStateClosed(offer?.pairState || PairState.PerpetualClosed))
      .compact()
      .value()
  }, [optimisticOffers, data, marketPubkey])

  const updateOrAddOffer = (offer: BondOfferV3) => {
    updateOffer([offer])
  }

  return { offers, updateOrAddOffer, isLoading }
}

type LendTokenTabsState = {
  tab: LendTokenTabName | null
  setTab: (tab: LendTokenTabName | null) => void
}

export const useLendTokenTabs = create<LendTokenTabsState>((set) => ({
  tab: null,
  setTab: (tab) => set({ tab }),
}))
