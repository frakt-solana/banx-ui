import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useInfiniteQuery } from '@tanstack/react-query'

import { SortOption } from '@banx/components/SortDropdown'

import { fetchBorrowerActivity } from '@banx/api/activity'

import { DEFAULT_SORT_OPTION } from '../constants'

import styles from '../LoansHistoryTable.module.less'

const PAGINATION_LIMIT = 15

export const useBorrowerActivity = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])

  const [sortBy, order] = sortOption.value.split('_')

  const fetchData = async (pageParam: number) => {
    const data = await fetchBorrowerActivity({
      skip: PAGINATION_LIMIT * pageParam,
      limit: PAGINATION_LIMIT,
      sortBy,
      order,
      walletPubkey: publicKeyString,
      collection: selectedCollections,
    })

    return { pageParam, data }
  }

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['borrowerActivity', publicKey, sortOption, selectedCollections],
    queryFn: ({ pageParam = 0 }) => fetchData(pageParam),
    getPreviousPageParam: (firstPage) => {
      return firstPage.pageParam - 1 ?? undefined
    },
    getNextPageParam: (lastPage) => {
      return lastPage.data?.length ? lastPage.pageParam + 1 : undefined
    },
    staleTime: 60 * 1000,
    cacheTime: 100_000,
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
      className: styles.sortDropdown,
    },
    selectedCollections,
    setSelectedCollections,
  }
}
