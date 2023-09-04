import { useMemo, useState } from 'react'

import { first, groupBy, map, sumBy } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { SortOption } from '@banx/components/SortDropdown'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { DEFAULT_SORT_OPTION } from '../../LoansActiveTable/constants'
import { useBorrowerActivity } from './useBorrowerActivity'

interface SearchSelectOption {
  collectionName: string
  collectionImage: string
  borrowed: number
}

export const useHistoryLoansTable = () => {
  const { loans, isLoading } = useBorrowerActivity()
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const searchSelectOptions = useMemo(() => {
    const loansGroupedByCollection = groupBy(loans, (loans) => loans.nft.meta.collectionName)

    return map(loansGroupedByCollection, (groupedLoans) => {
      const firstLoanInGroup = first(groupedLoans)
      const { collectionName = '', collectionImage = '' } = firstLoanInGroup?.nft.meta || {}
      const borrowed = sumBy(groupedLoans, (nft) => nft.borrowed)

      return { collectionName, collectionImage, borrowed }
    })
  }, [loans])

  const searchSelectParams: SearchSelectProps<SearchSelectOption> = {
    options: searchSelectOptions,
    optionKeys: {
      labelKey: 'collectionName',
      valueKey: 'collectionName',
      imageKey: 'collectionImage',
      secondLabel: {
        key: 'borrowed',
        format: (value: number) => createSolValueJSX(value, 1e9),
      },
    },
    selectedOptions,
    labels: ['Collection', 'Borrowed'],
    onChange: setSelectedOptions,
  }

  const sortParams = {
    option: sortOption,
    onChange: setSortOption,
  }

  return {
    loans,
    loading: isLoading,
    sortViewParams: {
      searchSelectParams,
      sortParams,
    },
  }
}
