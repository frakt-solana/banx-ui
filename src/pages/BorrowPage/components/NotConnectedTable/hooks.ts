import { useMemo, useState } from 'react'

import { get, sortBy } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { SortOption } from '@banx/components/SortDropdown'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { MarketPreview } from '@banx/api/core'
import { useMarketsPreview } from '@banx/pages/LendPage/hooks'

import { DEFAULT_SORT_OPTION } from './constants'

import styles from './NotConnectedTable.module.less'

export const useNotConnectedBorrow = () => {
  const { marketsPreview, isLoading } = useMarketsPreview()

  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([])

  const showEmptyList = !isLoading && !marketsPreview?.length

  const handleFilterChange = (filteredOptions: string[]) => {
    setSelectedMarkets(filteredOptions)
  }

  const filteredMarkets = useMemo(() => {
    return marketsPreview.filter(({ collectionName }) => selectedMarkets.includes(collectionName))
  }, [marketsPreview, selectedMarkets])

  const { sortedMarkets, sortParams } = useSortMarkets(
    filteredMarkets.length ? filteredMarkets : marketsPreview,
  )

  const searchSelectParams: SearchSelectProps<MarketPreview> = {
    options: marketsPreview,
    selectedOptions: selectedMarkets,
    placeholder: 'Select a collection',
    labels: ['Collection', 'Liquidity'],
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'marketPubkey',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'offerTvl',
        format: (value: number) => createSolValueJSX(value, 1e9),
      },
    },
    onChange: handleFilterChange,
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

const useSortMarkets = (markets: MarketPreview[]) => {
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const sortOptionValue = sortOption?.value

  const sortedMarkets = useMemo(() => {
    if (!sortOptionValue) {
      return markets
    }

    const [name, order] = sortOptionValue.split('_')

    const sortValueMapping: Record<SortField, string> = {
      [SortField.LIQUIDITY]: 'offerTVL',
      [SortField.BORROW]: 'bestOffer',
      [SortField.FLOOR]: 'collectionFloor',
    }

    const sorted = sortBy(markets, (loan) => {
      const sortValue = sortValueMapping[name as SortField]
      return get(loan, sortValue)
    })

    return order === 'desc' ? sorted.reverse() : sorted
  }, [sortOptionValue, markets])

  return {
    sortedMarkets,
    sortParams: {
      option: sortOption,
      onChange: setSortOption,
      className: styles.sortDropdown,
    },
  }
}
