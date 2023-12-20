import { useEffect, useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { chain, map, maxBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { fetchUserOffers } from '@banx/api/core'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { isOfferNewer, isOptimisticOfferExpired, useOffersOptimistic } from '@banx/store'
import { isOfferClosed } from '@banx/utils'

const PAGINATION_LIMIT = 15

export const useUserOffers = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { optimisticOffers, remove: removeOffers, update: updateOrAddOffer } = useOffersOptimistic()

  const [currentOption, setCurrentOption] = useState<SortOption>(DEFAULT_SORT_OPTION)
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])

  const { marketsPreview } = useMarketsPreview()

  const fetchData = async (pageParam: number) => {
    const [sortBy, order] = currentOption.value.split('_')

    const data = await fetchUserOffers({
      skip: PAGINATION_LIMIT * pageParam,
      limit: PAGINATION_LIMIT,
      walletPubkey: publicKeyString,
      sortBy,
      order,
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
        const isBEOfferNewer = isOfferNewer(sameOfferFromBE, offer)
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
  }, [marketsPreview, offersFlat, optimisticOffers, publicKey])

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

export const DEFAULT_SORT_OPTION = {
  label: SORT_OPTIONS[1].label,
  value: `${SORT_OPTIONS[1].value}_desc`,
}
