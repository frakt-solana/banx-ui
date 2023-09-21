import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useInfiniteQuery } from '@tanstack/react-query'

import { RBOption } from '@banx/components/RadioButton'

import { fetchLenderActivity } from '@banx/api/activity'

import { useMarketsPreview } from '../../hooks'
import { RADIO_BUTTONS_OPTIONS } from './constants'
import { appendIdToOptions } from './helpers'

const PAGINATION_LIMIT = 15

export const useAllLenderActivity = (marketPubkey: string) => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { marketsPreview } = useMarketsPreview()

  const options = appendIdToOptions(RADIO_BUTTONS_OPTIONS, marketPubkey)

  const [checked, setChecked] = useState<boolean>(false)
  const [currentOption, setCurrentOption] = useState<RBOption>(options[0])

  const eventType = currentOption.value.split('_')[0]
  const currentMarket = marketsPreview.find((market) => market.marketPubkey === marketPubkey)

  const fetchData = async (pageParam: number) => {
    const data = await fetchLenderActivity({
      skip: PAGINATION_LIMIT * pageParam,
      limit: PAGINATION_LIMIT,
      state: eventType,
      sortBy: 'timestamp',
      order: 'desc',
      collection: [currentMarket?.collectionName ?? ''],
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
    networkMode: 'offlineFirst',
    refetchOnWindowFocus: false,
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
      options,
    },
  }
}
