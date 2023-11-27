import { useMemo, useState } from 'react'

import { get, sortBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { Offer } from '@banx/api/core'

import { DEFAULT_SORT_OPTION, SORT_OPTIONS } from '../constants'

enum SortField {
  CLAIM = 'claim',
}

export const useSortedOffers = (offers: Offer[]) => {
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const sortOptionValue = sortOption?.value

  const sortedMarkets = useMemo(() => {
    if (!sortOptionValue) return offers

    const [name, order] = sortOptionValue.split('_')

    const sortValueMapping: Record<SortField, string> = {
      [SortField.CLAIM]: 'claim',
    }

    const sorted = sortBy(offers, (loan) => {
      const sortValue = sortValueMapping[name as SortField]
      return get(loan, sortValue)
    })

    return order === 'desc' ? sorted.reverse() : sorted
  }, [sortOptionValue, offers])

  return {
    sortedMarkets,
    sortParams: {
      option: sortOption,
      onChange: setSortOption,
      options: SORT_OPTIONS,
    },
  }
}
