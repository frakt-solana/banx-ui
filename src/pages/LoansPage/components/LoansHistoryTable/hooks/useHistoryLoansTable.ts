import { useMemo, useState } from 'react'

import { first, groupBy, map } from 'lodash'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { SortOption } from '@banx/components/SortDropdown'
import { createSolValueJSX } from '@banx/components/TableComponents'

import { DEFAULT_SORT_OPTION } from '@banx/pages/LoansPage/constants'
import { useUserOffers } from '@banx/pages/OffersPage/components/PendingOffersTable/hooks'

interface SearchSelectOption {
  collectionName: string
  collectionImage: string
  borrowed: number
}

export const useHistoryLoansTable = () => {
  const { offers, loading } = useUserOffers()
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const searchSelectOptions = useMemo(() => {
    const offersGroupedByCollection = groupBy(offers, (offer) => offer.collectionName)

    return map(offersGroupedByCollection, (groupedOffers) => {
      const firstLoanInGroup = first(groupedOffers)
      const {
        collectionName = '',
        collectionImage = '',
        fundsSolOrTokenBalance = 0,
      } = firstLoanInGroup || {}

      const borrowed = fundsSolOrTokenBalance

      return { collectionName, collectionImage, borrowed }
    })
  }, [offers])

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
    offers,
    loading,
    sortViewParams: {
      searchSelectParams,
      sortParams,
    },
  }
}
