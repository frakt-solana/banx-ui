import { useMemo, useState } from 'react'

import { isEmpty } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { createPercentValueJSX } from '@banx/components/TableComponents'

import { MarketPreview } from '@banx/api/core'
import { useMarketsPreview } from '@banx/pages/LendPage'
import { createGlobalState } from '@banx/store/functions'

import { useSortedMarkets } from './useSortedMarkets'

const useCollectionsStore = createGlobalState<string[]>([])

export const useRequestLoansContent = () => {
  const { marketsPreview, isLoading: isLoadingMarkets } = useMarketsPreview()

  const [selectedCollections, setSelectedCollections] = useCollectionsStore()
  const [visibleMarketPubkey, setMarketPubkey] = useState('')

  const onCardClick = (marketPubkey: string) => {
    const isSameMarketPubkey = visibleMarketPubkey === marketPubkey
    const nextValue = !isSameMarketPubkey ? marketPubkey : ''
    return setMarketPubkey(nextValue)
  }

  const filteredMarkets = useMemo(() => {
    if (!selectedCollections.length) return marketsPreview

    return marketsPreview.filter(({ collectionName }) =>
      selectedCollections.includes(collectionName),
    )
  }, [marketsPreview, selectedCollections])

  const { sortedMarkets, sortParams } = useSortedMarkets(filteredMarkets)

  const searchSelectParams = createSearchSelectParams({
    options: marketsPreview,
    selectedOptions: selectedCollections,
    onChange: setSelectedCollections,
  })

  const isLoading = isLoadingMarkets && isEmpty(marketsPreview)

  return {
    markets: sortedMarkets,

    visibleMarketPubkey,
    onCardClick,

    searchSelectParams,
    sortParams,

    isLoading,
  }
}

type CreateSearchSelectParams = (props: {
  options: MarketPreview[]
  selectedOptions: string[]
  onChange: (option: string[]) => void
}) => SearchSelectProps<MarketPreview>

const createSearchSelectParams: CreateSearchSelectParams = ({
  options,
  selectedOptions,
  onChange,
}) => {
  const searchSelectParams = {
    options,
    selectedOptions,
    placeholder: 'Select a collection',
    labels: ['Collection', 'Max APR'],
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'marketPubkey',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'marketApr',
        format: (value: number) => createPercentValueJSX(value),
      },
    },
    onChange,
  }

  return searchSelectParams
}
