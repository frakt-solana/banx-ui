import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useInfiniteQuery } from '@tanstack/react-query'

import { RBOption } from '@banx/components/RadioButton'

import { fetchLeaderboardData } from '@banx/api/user'

const PAGINATION_LIMIT = 5

export const useLeaderboardData = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const [currentOption, setCurrentOption] = useState<RBOption>(options[0])

  const fetchData = async (pageParam: number) => {
    const data = await fetchLeaderboardData({
      skip: PAGINATION_LIMIT * pageParam,
      limit: PAGINATION_LIMIT,
      walletPubkey: publicKeyString,
    })

    return { pageParam, data }
  }

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['leaderboardData', publicKey],
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
  })

  const leaderboardData = useMemo(() => {
    return data?.pages?.map((page) => page.data).flat() || []
  }, [data])

  return {
    data: leaderboardData,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    filterParams: {
      onOptionChange: setCurrentOption,
      currentOption,
      options,
    },
  }
}

const options: RBOption[] = [
  {
    label: 'Lender',
    value: 'lender',
  },
  {
    label: 'Borrower',
    value: 'borrower',
  },
]
