import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { PairState } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, map, maxBy } from 'lodash'

import { Offer, fetchLenderLoansAndOffers } from '@banx/api/core'
import { fetchUserOffersStats } from '@banx/api/stats'
import { isOfferNewer, isOptimisticOfferExpired, useOffersOptimistic } from '@banx/store'

export const USE_USER_OFFERS_QUERY_KEY = 'userOffers'

export const useUserOffers = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { optimisticOffers, remove: removeOffers, update: updateOrAddOffer } = useOffersOptimistic()

  const {
    data,
    isLoading: isUserOffersLoading,
    isFetching: isUserOffersFetching,
    isFetched: isUserOffersFetched,
  } = useQuery(
    [USE_USER_OFFERS_QUERY_KEY, publicKeyString],
    () => fetchLenderLoansAndOffers({ walletPublicKey: publicKeyString }),
    {
      enabled: !!publicKeyString,
      refetchOnWindowFocus: false,
      refetchInterval: 30 * 1000,
    },
  )

  const userOffers = (data ?? []).map(({ offer }) => offer)

  //? Check expiredOffers and and purge them
  useEffect(() => {
    if (!userOffers || isUserOffersFetching || !isUserOffersFetched) return

    const expiredOffersByTime = optimisticOffers.filter((offer) => isOptimisticOfferExpired(offer))

    const optimisticsToRemove = chain(optimisticOffers)
      .filter(({ offer }) => offer?.pairState !== PairState.PerpetualClosed)
      .filter(({ offer }) => offer?.pairState !== PairState.PerpetualBondingCurveClosed)
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

    const optimisticUserOffers: Offer[] = optimisticOffers
      .map(({ offer }) => offer)
      .filter(({ assetReceiver }) => assetReceiver === publicKey?.toBase58())

    const combinedOffers = [...optimisticUserOffers, ...(userOffers ?? [])]

    return chain(combinedOffers)
      .groupBy('publicKey')
      .map((offers) => maxBy(offers, 'lastTransactedAt'))
      .filter((offer) => offer?.pairState !== PairState.PerpetualClosed)
      .filter((offer) => offer?.pairState !== PairState.PerpetualBondingCurveClosed)
      .compact()
      .value()
  }, [userOffers, optimisticOffers, publicKey])

  return {
    offers,
    loading: isUserOffersLoading,
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
