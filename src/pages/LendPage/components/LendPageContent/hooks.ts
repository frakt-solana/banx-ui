import { useState } from 'react'

import { SortOption } from '@banx/components/SortDropdown'

import { convertAprToApy } from '@banx/utils'

import { useMarketsPreview } from '../../hooks'
import { defaultSortOption, sortOptions } from './constants'

export const useFilteredMarkets = () => {
  const { marketsPreview, isLoading } = useMarketsPreview()

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const showEmptyList = !isLoading && !marketsPreview?.length

  const handleFilterChange = (filteredOptions: string[]) => {
    setSelectedOptions(filteredOptions)
  }

  const [sortOption, setSortOption] = useState<SortOption>(defaultSortOption)

  return {
    marketsPreview,
    isLoading,
    showEmptyList,
    searchSelectParams: {
      options: marketsPreview,
      selectedOptions,
      placeholder: 'Select a collection',
      labels: ['Collections', 'APY'],
      optionKeys: {
        labelKey: 'collectionName',
        valueKey: 'marketPubkey',
        imageKey: 'collectionImage',
        secondLabelKey: {
          key: 'marketAPR',
          format: (value: number) => `${convertAprToApy(value / 100)?.toFixed(0)} %`,
        },
      },
      onChange: handleFilterChange,
    },
    sortParams: { option: sortOption, onChange: setSortOption, options: sortOptions },
  }
}
