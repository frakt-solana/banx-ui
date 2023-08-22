import { useState } from 'react'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { SortOption } from '@banx/components/SortDropdown'

import { DEFAULT_SORT_OPTION } from '@banx/pages/LoansPage/constants'

interface SearchSelectOption {
  collectionName: string
  collectionImage: string
}

export const usePendingOfferTab = () => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const searchSelectParams: SearchSelectProps<SearchSelectOption> = {
    options: mockOptions,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
    },
    selectedOptions,
    labels: ['Collection', 'Best offer'],
    onChange: setSelectedOptions,
  }

  const sortParams = {
    option: sortOption,
    onChange: setSortOption,
  }

  return {
    offers: [],
    sortViewParams: {
      searchSelectParams,
      sortParams,
    },
  }
}

const mockOptions = [
  {
    collectionName: 'Banx',
    collectionImage: 'https://banxnft.s3.amazonaws.com/images/6906.png',
  },
]
