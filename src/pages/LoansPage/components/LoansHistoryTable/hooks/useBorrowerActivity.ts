import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useInfiniteQuery } from '@tanstack/react-query'

import { fetchBorrowerActivity } from '@banx/api/activity'
import { useLocalStorage } from '@banx/hooks'
import { SORT_STORAGE_KEY, createSortParams } from '@banx/utils'

import { DEFAULT_SORT_OPTION } from '../constants'

enum SortField {
  BORROWED = 'borrowed',
  REPAID = 'repaid',
  TIMESTAMP = 'timestamp',
}

const SORT_OPTIONS = [
  { label: 'Borrowed', value: SortField.BORROWED },
  { label: 'Repaid', value: SortField.REPAID },
  { label: 'When', value: SortField.TIMESTAMP },
]

const PAGINATION_LIMIT = 15

export const useBorrowerActivity = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const [sortOptionValue, setSortOptionValue] = useLocalStorage(
    SORT_STORAGE_KEY.LOANS_HISTORY,
    DEFAULT_SORT_OPTION.value,
  )

  const [selectedCollections, setSelectedCollections] = useState<string[]>([])

  const [sortBy, order] = sortOptionValue.split('_')

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
    queryKey: ['borrowerActivity', publicKey, sortOptionValue, selectedCollections],
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

  const sortParams = useMemo(() => {
    return createSortParams({
      sortOptionValue,
      setSortOptionValue,
      defaultOption: DEFAULT_SORT_OPTION,
      options: SORT_OPTIONS,
    })
  }, [setSortOptionValue, sortOptionValue])

  return {
    loans,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    sortParams,
    selectedCollections,
    setSelectedCollections,
  }
}
