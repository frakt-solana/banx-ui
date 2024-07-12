import { useMemo, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { first, groupBy, isEmpty, map } from 'lodash'

import { createPercentValueJSX } from '@banx/components/TableComponents'

import { core } from '@banx/api/tokens'
import { createGlobalState } from '@banx/store'

import { useTokenMarketsPreview } from '../../hooks'
import { useSortedMarkets } from './useSortedMarkets'

const useCollectionsStore = createGlobalState<string[]>([])

export const usePlaceTokenOffersContent = () => {
  const { connected } = useWallet()

  const { marketsPreview, isLoading: isLoadingMarkets } = useTokenMarketsPreview()

  const [selectedCollections, setSelectedCollections] = useCollectionsStore()

  const [visibleMarketPubkey, setMarketPubkey] = useState('')

  const onCardClick = (marketPubkey: string) => {
    const isSameMarketPubkey = visibleMarketPubkey === marketPubkey
    const nextValue = !isSameMarketPubkey ? marketPubkey : ''
    return setMarketPubkey(nextValue)
  }

  const filteredMarkets = useMemo(() => {
    if (!selectedCollections.length) return marketsPreview

    return marketsPreview.filter((market) => selectedCollections.includes(market.collateral.ticker))
  }, [marketsPreview, selectedCollections])

  const { sortedMarkets, sortParams } = useSortedMarkets(filteredMarkets)

  const searchSelectParams = createSearchSelectParams({
    options: marketsPreview,
    selectedOptions: selectedCollections,
    onChange: setSelectedCollections,
  })

  const isLoading = isLoadingMarkets && isEmpty(marketsPreview)
  const showEmptyList = connected && !isLoadingMarkets && isEmpty(filteredMarkets)

  return {
    marketsPreview: sortedMarkets,
    visibleMarketPubkey,
    onCardClick,

    searchSelectParams,
    sortParams,

    showEmptyList,
    isLoading,
  }
}

interface CreateSearchSelectProps {
  options: core.TokenMarketPreview[]
  selectedOptions: string[]
  onChange: (option: string[]) => void
}

const createSearchSelectParams = ({
  options,
  selectedOptions,
  onChange,
}: CreateSearchSelectProps) => {
  const marketsGroupedByTicker = groupBy(options, (market) => market.collateral.ticker)

  const searchSelectOptions = map(marketsGroupedByTicker, (groupedMarkets) => {
    const firstMarketInGroup = first(groupedMarkets)
    const { ticker = '', logoUrl = '' } = firstMarketInGroup?.collateral || {}
    const marketApr = firstMarketInGroup?.marketApr

    return { ticker, logoUrl, marketApr }
  })

  const searchSelectParams = {
    options: searchSelectOptions,
    selectedOptions,
    onChange,
    labels: ['Collateral', 'APR'],
    optionKeys: {
      labelKey: 'ticker',
      valueKey: 'marketPubkey',
      imageKey: 'logoUrl',
      secondLabel: {
        key: 'marketApr',
        format: (value: number) => createPercentValueJSX(value),
      },
    },
  }

  return searchSelectParams
}
