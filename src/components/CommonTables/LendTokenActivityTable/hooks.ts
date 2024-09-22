import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useInfiniteQuery } from '@tanstack/react-query'

import { RBOption } from '@banx/components/RadioButton'

import { activity } from '@banx/api/tokens'
import { useTokenMarketsPreview } from '@banx/pages/tokenLending/LendTokenPage'
import { useTokenType } from '@banx/store/common'

const PAGINATION_LIMIT = 15

export const useLendTokenActivity = (marketPubkey: string) => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''

  const { tokenType } = useTokenType()

  const { marketsPreview } = useTokenMarketsPreview()

  const options = appendIdToOptions(RADIO_BUTTONS_OPTIONS, marketPubkey)
  const loanedOption = options[1]

  const [checked, setChecked] = useState<boolean>(false)
  const [currentOption, setCurrentOption] = useState<RBOption>(loanedOption)

  const eventType = currentOption.value.split('_')[0]
  const currentMarket = marketsPreview.find((market) => market.marketPubkey === marketPubkey)

  const fetchData = async (pageParam: number) => {
    const data = await activity.fetchLenderTokenActivity({
      skip: PAGINATION_LIMIT * pageParam,
      limit: PAGINATION_LIMIT,
      state: eventType,
      sortBy: 'timestamp',
      order: 'desc',
      collection: [currentMarket?.collectionName ?? ''],
      walletPubkey: checked ? publicKeyString : '',
      tokenType,
    })

    return { pageParam, data }
  }

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['allLenderTokenActivity', publicKey, checked, currentOption, tokenType],
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

  const showEmptyList = !loans?.length && !isLoading

  const isRadioButtonDisabled = showEmptyList && eventType === ActivityEvent.ALL
  const isToggleDisabled = !checked && showEmptyList

  return {
    loans,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    showEmptyList,
    isRadioButtonDisabled,
    isToggleDisabled,
    filterParams: {
      checked,
      onToggleChecked: () => setChecked(!checked),
      currentOption,
      onOptionChange: setCurrentOption,
      options,
    },
  }
}

enum ActivityEvent {
  ALL = 'all',
  LOANED = 'loaned',
  REPAID = 'repaid',
  LIQUIDATED = 'liquidated',
}

const RADIO_BUTTONS_OPTIONS = [
  {
    label: 'All',
    value: ActivityEvent.ALL,
  },
  {
    label: 'Loaned',
    value: ActivityEvent.LOANED,
  },
  {
    label: 'Repaid',
    value: ActivityEvent.REPAID,
  },
  {
    label: 'Liquidated',
    value: ActivityEvent.LIQUIDATED,
  },
]

const appendIdToOptions = (options: RBOption[], id: string) => {
  return options.map((option) => {
    return {
      ...option,
      value: `${option.value}_${id}`,
    }
  })
}
