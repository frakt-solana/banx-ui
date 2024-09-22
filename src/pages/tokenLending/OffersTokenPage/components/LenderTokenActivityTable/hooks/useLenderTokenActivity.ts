import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { SortOption } from '@banx/components/SortDropdown'

import { activity } from '@banx/api/tokens'
import { createGlobalState } from '@banx/store'
import { useTokenType } from '@banx/store/common'

const PAGINATION_LIMIT = 15

const useCollectionsStore = createGlobalState<string[]>([])

export const useLenderTokenActivity = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])
  const [selectedCollections, setSelectedCollections] = useCollectionsStore()

  const [sortBy, order] = sortOption.value

  const fetchData = async (pageParam: number) => {
    const data = await activity.fetchLenderTokenActivity({
      skip: PAGINATION_LIMIT * pageParam,
      limit: PAGINATION_LIMIT,
      sortBy,
      order,
      walletPubkey: publicKeyString,
      collection: selectedCollections,
      tokenType,
    })

    return { pageParam, data }
  }

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['lenderTokenActivity', publicKey, sortOption, selectedCollections, tokenType],
    queryFn: ({ pageParam = 0 }) => fetchData(pageParam),
    getPreviousPageParam: (firstPage) => {
      return firstPage.pageParam - 1 ?? undefined
    },
    getNextPageParam: (lastPage) => {
      return lastPage.data?.length ? lastPage.pageParam + 1 : undefined
    },
    staleTime: 60 * 1000,
    networkMode: 'offlineFirst',
    refetchOnWindowFocus: false,
    enabled: !!publicKeyString,
  })

  const loans = useMemo(() => {
    return data?.pages?.map((page) => page.data).flat() || []
  }, [data])

  return {
    loans,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    sortParams: {
      option: sortOption,
      onChange: setSortOption,
      options: SORT_OPTIONS,
    },
    selectedCollections,
    setSelectedCollections,
  }
}

enum SortField {
  DURATION = 'timestamp',
  LENT = 'lent',
  INTEREST = 'interest',
  RECEIVED = 'received',
  APR = 'apr',
}

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'When', value: [SortField.DURATION, 'desc'] },
  { label: 'Lent', value: [SortField.LENT, 'desc'] },
  { label: 'Interest', value: [SortField.INTEREST, 'desc'] },
  { label: 'Received', value: [SortField.RECEIVED, 'desc'] },
  { label: 'APR', value: [SortField.APR, 'desc'] },
]

export const useLenderTokenActivityCollectionsList = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const { data, isLoading } = useQuery(
    ['lenderTokenActivityCollectionsList', publicKeyString, tokenType],
    () =>
      activity.fetchTokenActivityCollectionsList({
        walletPubkey: publicKeyString,
        userType: 'lender',
        tokenType,
      }),
    {
      enabled: !!publicKeyString,
      staleTime: 5 * 1000,
      refetchOnWindowFocus: false,
      refetchInterval: 15 * 1000,
    },
  )

  return {
    data: data ?? [],
    isLoading,
  }
}
