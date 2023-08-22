import { useState } from 'react'

import { SortOption } from '@banx/components/SortDropdown'

import { DEFAULT_SORT_OPTION } from '../../constants'

export const usePendingOfferTab = () => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  return {
    offers: [],
    sortViewParams: {
      searchSelectParams: {
        options: mockOptions,
        optionKeys: {
          labelKey: 'collectionName',
          valueKey: 'collectionName',
          imageKey: 'collectionImage',
        },
        selectedOptions,
        labels: ['Collection', 'Best offer'],
        onChange: setSelectedOptions,
      },
      sortParams: { option: sortOption, onChange: setSortOption },
    },
  }
}

const mockOptions = [
  {
    collectionName: 'Banx',
    collectionImage: 'https://banxnft.s3.amazonaws.com/images/6906.png',
  },
]
