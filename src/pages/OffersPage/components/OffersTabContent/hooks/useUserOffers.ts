import { useEffect, useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { chain, map, maxBy } from 'lodash'

import { RBOption } from '@banx/components/RadioButton'

import { Offer, fetchUserOffers } from '@banx/api/core'
import { isOfferNewer, isOptimisticOfferExpired, useOffersOptimistic } from '@banx/store'
import { isOfferClosed } from '@banx/utils'

const PAGINATION_LIMIT = 15

export const useUserOffers = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { optimisticOffers, remove: removeOffers, update: updateOrAddOffer } = useOffersOptimistic()

  const [currentOption, setCurrentOption] = useState<RBOption>(SORT_OPTIONS[0])
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])

  const fetchData = async (pageParam: number) => {
    const data = await fetchUserOffers({
      skip: PAGINATION_LIMIT * pageParam,
      limit: PAGINATION_LIMIT,
      walletPubkey: publicKeyString,
    })

    return { pageParam, data }
  }

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading, isFetched, isFetching } =
    useInfiniteQuery({
      queryKey: ['useUserOffers', publicKey, currentOption],
      queryFn: ({ pageParam = 0 }) => fetchData(pageParam),
      getPreviousPageParam: (firstPage) => {
        return firstPage.pageParam - 1 ?? undefined
      },
      getNextPageParam: (lastPage) => {
        return lastPage.data?.length ? lastPage.pageParam + 1 : undefined
      },
      refetchOnWindowFocus: false,
    })

  const offersFlat = useMemo(() => {
    return data?.pages?.map((page) => page.data).flat() || []
  }, [data])

  //? Check expiredOffers and and purge them
  useEffect(() => {
    const userOffers = offersFlat.map(({ offer }) => offer)

    if (!userOffers || isFetching || !isFetched) return

    const expiredOffersByTime = optimisticOffers.filter((offer) => isOptimisticOfferExpired(offer))

    const optimisticsToRemove = chain(optimisticOffers)
      .filter(({ offer }) => !isOfferClosed(offer?.pairState))
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
  }, [offersFlat, isFetching, isFetched, optimisticOffers, removeOffers])

  const offers = useMemo(() => {
    const userOffers = offersFlat.map((offer) => offer)

    if (!userOffers || !optimisticOffers) return []

    const optimisticUserOffers = optimisticOffers
      .map((offer) => {
        return {
          offer: offer.offer,
          collectionMeta: {
            collectionFloor: 0,
            collectionName: '',
            collectionImage: '',
          },
        }
      })
      .filter(({ offer }) => offer.assetReceiver === publicKey?.toBase58())

    const combinedOffers = [...optimisticUserOffers, ...userOffers]

    return chain(combinedOffers)
      .groupBy(({ offer }) => offer.publicKey)
      .map((offers) => maxBy(offers, ({ offer }) => offer.lastTransactedAt))
      .compact()
      .value()
  }, [offersFlat, optimisticOffers, publicKey])

  return {
    offers,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    selectedCollections,
    setSelectedCollections,
    updateOrAddOffer,
    sortParams: {
      onChange: setCurrentOption,
      option: currentOption,
      options: SORT_OPTIONS,
    },
  }
}

const SORT_OPTIONS = [
  { label: 'Claim', value: 'claim' },
  { label: 'Lent', value: 'lent' },
  { label: 'Offer', value: 'offer' },
]
