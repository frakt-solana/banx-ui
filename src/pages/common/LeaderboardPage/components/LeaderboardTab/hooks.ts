import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useInfiniteQuery } from '@tanstack/react-query'

import { RBOption } from '@banx/components/RadioButton'

import { user } from '@banx/api/common'

const PAGINATION_LIMIT = 15

export const useLeaderboardData = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const [currentOption, setCurrentOption] = useState<RBOption>(options[0])
  const [timeRangeType, setTimeRangeType] = useState<user.LeaderboardTimeRange>('week')

  const fetchData = async (pageParam: number) => {
    const data = await user.fetchLeaderboardData({
      skip: PAGINATION_LIMIT * pageParam,
      limit: PAGINATION_LIMIT,
      userType: currentOption.value,
      walletPubkey: publicKeyString,
      timeRangeType,
    })

    return { pageParam, data }
  }

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['leaderboardData', publicKey, currentOption, timeRangeType],
    queryFn: ({ pageParam = 0 }) => fetchData(pageParam),
    getPreviousPageParam: (firstPage) => {
      return firstPage.pageParam - 1 ?? undefined
    },
    getNextPageParam: (lastPage) => {
      return lastPage.data?.length ? lastPage.pageParam + 1 : undefined
    },
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
    onChangeTimeRange: setTimeRangeType,
    timeRangeType,
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
