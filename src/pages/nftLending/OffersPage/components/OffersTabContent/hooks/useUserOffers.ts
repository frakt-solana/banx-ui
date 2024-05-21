import { useEffect, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { chain, map, maxBy } from 'lodash'

import { core } from '@banx/api/nft'
import { useMarketsPreview } from '@banx/pages/nftLending/LendPage/hooks'
import {
  isOfferNewer,
  isOptimisticOfferExpired,
  useOffersOptimistic,
  useTokenType,
} from '@banx/store/nft'
import { isOfferClosed } from '@banx/utils'

export const useUserOffers = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { optimisticOffers, remove: removeOffers, update: updateOrAddOffer } = useOffersOptimistic()

  const { marketsPreview } = useMarketsPreview()

  const { tokenType } = useTokenType()

  const { data, isLoading, isFetching, isFetched } = useQuery(
    [useUserOffers, publicKeyString, tokenType],
    () => core.fetchUserOffers({ walletPubkey: publicKeyString, tokenType }),
    {
      enabled: !!publicKeyString,
      refetchOnWindowFocus: false,
      refetchInterval: 30 * 1000,
    },
  )

  useEffect(() => {
    if (!data) return

    const userOffers = data.map(({ offer }) => offer)

    if (!userOffers || isFetching || !isFetched) return

    const expiredOffersByTime = optimisticOffers.filter((offer) => isOptimisticOfferExpired(offer))

    const optimisticsToRemove = chain(optimisticOffers)
      .filter(({ offer }) => !isOfferClosed(offer?.pairState))
      .filter(({ offer }) => {
        const sameOfferFromBE = userOffers?.find(({ publicKey }) => publicKey === offer.publicKey)
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
  }, [data, isFetching, isFetched, optimisticOffers, removeOffers])

  const offers = useMemo(() => {
    if (!data) return []

    const userOffers = data.map((offer) => offer)

    if (!userOffers || !optimisticOffers) return []

    const optimisticUserOffers = optimisticOffers
      .map(({ offer }) => {
        const {
          collectionName = '',
          collectionImage = '',
          collectionFloor = 0,
        } = marketsPreview.find(({ marketPubkey }) => marketPubkey === offer.hadoMarket) ?? {}

        return { offer, collectionMeta: { collectionFloor, collectionName, collectionImage } }
      })
      .filter(({ offer }) => offer.assetReceiver === publicKey?.toBase58())

    const combinedOffers = [...optimisticUserOffers, ...userOffers]

    return chain(combinedOffers)
      .groupBy(({ offer }) => offer.publicKey)
      .map((groupedOffers) => maxBy(groupedOffers, ({ offer }) => offer.lastTransactedAt))
      .compact()
      .filter(({ offer }) => !isOfferClosed(offer.pairState))
      .value()
  }, [marketsPreview, data, optimisticOffers, publicKey])

  return {
    offers,
    isLoading,
    updateOrAddOffer,
  }
}
