import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useInfiniteQuery } from '@tanstack/react-query'

import { RBOption } from '@banx/components/RadioButton'

import { fetchLenderActivity } from '@banx/api/activity'

import { RADIO_BUTTONS_OPTIONS } from './constants'

const PAGINATION_LIMIT = 15

export const useAllLenderActivity = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const [checked, setChecked] = useState<boolean>(false)
  const [currentOption, setCurrentOption] = useState<RBOption>(RADIO_BUTTONS_OPTIONS[0])

  const fetchData = async (pageParam: number) => {
    const data = await fetchLenderActivity({
      skip: PAGINATION_LIMIT * pageParam,
      limit: PAGINATION_LIMIT,
      state: currentOption.value,
      sortBy: 'timestamp',
      order: 'desc',
      walletPubkey: checked ? publicKeyString : '',
    })

    return { pageParam, data }
  }

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['allLenderActivity', publicKey, checked, currentOption],
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
    filterParams: {
      checked,
      onToggleChecked: () => setChecked(!checked),
      currentOption,
      onOptionChange: setCurrentOption,
    },
  }
}
