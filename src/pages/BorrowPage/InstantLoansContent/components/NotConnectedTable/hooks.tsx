import { useMemo, useState } from 'react'

import { orderBy } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { SortOption } from '@banx/components/SortDropdown'
import { DisplayValue } from '@banx/components/TableComponents'

import { MarketPreview } from '@banx/api/core'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'
import { createGlobalState } from '@banx/store/functions'

import styles from './NotConnectedTable.module.less'

const useCollectionsStore = createGlobalState<string[]>([])

export const useNotConnectedBorrow = () => {
  const { marketsPreview, isLoading } = useMarketsPreview()

  const [selectedCollections, setSelectedCollections] = useCollectionsStore()

  const showEmptyList = !isLoading && !marketsPreview?.length

  const filteredMarkets = useMemo(() => {
    if (!selectedCollections.length) return marketsPreview

    return marketsPreview.filter(({ collectionName }) =>
      selectedCollections.includes(collectionName),
    )
  }, [marketsPreview, selectedCollections])

  const { sortedMarkets, sortParams } = useSortedMarkets(filteredMarkets)

  const searchSelectParams: SearchSelectProps<MarketPreview> = {
    options: marketsPreview,
    selectedOptions: selectedCollections,
    labels: ['Collection', 'Liquidity'],
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'marketPubkey',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'offerTvl',
        format: (value: number) => <DisplayValue value={value} />,
      },
    },
    onChange: setSelectedCollections,
    className: styles.searchSelect,
  }

  return {
    marketsPreview: sortedMarkets,
    isLoading,
    sortViewParams: { searchSelectParams, sortParams },
    showEmptyList,
  }
}

enum SortField {
  LIQUIDITY = 'liquidity',
  BORROW = 'borrow',
  FLOOR = 'collectionFloor',
}

type SortValueGetter = (market: MarketPreview) => number

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'Liquidity', value: [SortField.LIQUIDITY, 'desc'] },
  { label: 'Borrow', value: [SortField.BORROW, 'desc'] },
  { label: 'Floor', value: [SortField.FLOOR, 'desc'] },
]

const SORT_VALUE_MAP: Record<SortField, SortValueGetter> = {
  [SortField.LIQUIDITY]: (market) => market.offerTvl,
  [SortField.BORROW]: (market) => market.bestOffer,
  [SortField.FLOOR]: (market) => market.collectionFloor,
}

const useSortedMarkets = (markets: MarketPreview[]) => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])

  const sortedMarkets = useMemo(() => {
    if (!sortOption) return markets

    const [field, order] = sortOption.value

    const sortValueGetter = SORT_VALUE_MAP[field]
    return orderBy(markets, sortValueGetter, order)
  }, [sortOption, markets])

  const onChangeSortOption = (option: SortOption<SortField>) => {
    setSortOption(option)
  }

  return {
    sortedMarkets,
    sortParams: {
      option: sortOption,
      onChange: onChangeSortOption,
      options: SORT_OPTIONS,
    },
  }
}
