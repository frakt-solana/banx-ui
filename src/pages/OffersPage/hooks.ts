import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { PairState } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, map, maxBy } from 'lodash'

import { Offer, UserOffer, fetchUserOffers } from '@banx/api/core'
import { fetchUserOffersStats } from '@banx/api/stats'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { isOfferNewer, isOptimisticOfferExpired, useOffersOptimistic } from '@banx/store'

export const USE_USER_OFFERS_QUERY_KEY = 'userOffers'

export const useUserOffers = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''
  const { optimisticOffers, remove: removeOffers, update: updateOrAddOffer } = useOffersOptimistic()

  const { marketsPreview, isLoading: isMarketsPreviewLoading } = useMarketsPreview()

  const {
    data: userOffers,
    isLoading: isUserOffersLoading,
    isFetching: isUserOffersFetching,
    isFetched: isUserOffersFetched,
  } = useQuery(
    [USE_USER_OFFERS_QUERY_KEY, publicKeyString],
    () => fetchUserOffers({ walletPublicKey: publicKeyString }),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  //? Check expiredOffers and and purge them
  useEffect(() => {
    if (!userOffers || isUserOffersFetching || !isUserOffersFetched) return

    const expiredOffersByTime = optimisticOffers.filter((offer) => isOptimisticOfferExpired(offer))

    const optimisticsToRemove = chain(optimisticOffers)
      .filter(({ offer }) => offer?.pairState !== PairState.PerpetualClosed)
      .filter(({ offer }) => {
        const sameOfferFromBE = userOffers?.find(({ publicKey }) => publicKey === offer.publicKey)
        if (!sameOfferFromBE) return false
        const isBEOfferNewer = isOfferNewer(sameOfferFromBE as Offer, offer)
        return isBEOfferNewer
      })
      .value()

    if (optimisticsToRemove.length || expiredOffersByTime.length) {
      removeOffers(
        map([...expiredOffersByTime, ...optimisticsToRemove], ({ offer }) => offer.publicKey),
      )
    }
  }, [userOffers, isUserOffersFetching, isUserOffersFetched, optimisticOffers, removeOffers])

  const offers = useMemo(() => {
    if (!userOffers || !optimisticOffers) {
      return []
    }

    const optimisticUserOffers: UserOffer[] = optimisticOffers
      .map(({ offer }) => {
        const marketPreview = marketsPreview.find(
          ({ marketPubkey }) => marketPubkey === offer.hadoMarket,
        )

        return {
          ...offer,
          marketApr: marketPreview?.marketApr || 0,
          collectionFloor: marketPreview?.collectionFloor || 0,
          collectionImage: marketPreview?.collectionImage || '',
          collectionName: marketPreview?.collectionName || '',
        }
      })
      .filter(({ assetReceiver }) => assetReceiver === publicKey?.toBase58())

    const combinedOffers = [...optimisticUserOffers, ...(userOffers ?? [])]

    return chain(combinedOffers)
      .groupBy('publicKey')
      .map((offers) => maxBy(offers, 'lastTransactedAt'))
      .filter((offer) => offer?.pairState !== PairState.PerpetualClosed)
      .compact()
      .value()
  }, [userOffers, optimisticOffers, marketsPreview, publicKey])

  return {
    offers,
    loading: isUserOffersLoading || isMarketsPreviewLoading,
    updateOrAddOffer,
  }
}

export const useUserOffersStats = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { data, isLoading } = useQuery(
    ['userOffersStats', publicKeyString],
    () => fetchUserOffersStats(publicKeyString),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  return {
    data,
    isLoading,
  }
}
