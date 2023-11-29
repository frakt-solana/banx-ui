import { useMemo, useState } from 'react'

import { get, isFunction, sortBy, sumBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { LendLoansAndOffersV2 } from '@banx/api/core'

import { calculateClaimValue, calculateLentValue } from '../components/OfferCard/helpers'
import { DEFAULT_SORT_OPTION, SORT_OPTIONS } from '../constants'

enum SortField {
  CLAIM = 'claim',
  LENT = 'lent',
  OFFER = 'offer',
}

type SortValueGetter = (data: LendLoansAndOffersV2) => number

export const useSortedData = (data: LendLoansAndOffersV2[]) => {
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const sortOptionValue = sortOption?.value

  const sortedData = useMemo(() => {
    if (!sortOptionValue) return data

    const [name, order] = sortOptionValue.split('_')

    const sortValueMapping: Record<SortField, string | SortValueGetter> = {
      [SortField.CLAIM]: ({ loans }) => sumBy(loans, calculateClaimValue),
      [SortField.LENT]: ({ loans }) => sumBy(loans, calculateLentValue),
      [SortField.OFFER]: ({ offer }) => offer.currentSpotPrice,
    }

    const sorted = sortBy(data, (item) => {
      const sortValue = sortValueMapping[name as SortField]
      return isFunction(sortValue) ? sortValue(item) : get(item, sortValue)
    })

    return order === 'desc' ? sorted.reverse() : sorted
  }, [sortOptionValue, data])

  return {
    sortedData,
    sortParams: {
      option: sortOption,
      onChange: setSortOption,
      options: SORT_OPTIONS,
    },
  }
}
