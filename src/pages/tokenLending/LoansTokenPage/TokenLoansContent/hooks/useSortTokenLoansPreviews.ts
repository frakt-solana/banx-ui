import { useMemo, useState } from 'react'

import { orderBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { SORT_OPTIONS, SORT_VALUE_MAP } from '../constants'
import { LoansPreview, SortField } from '../types'

export const useSortTokenLoansPreviews = (loansPreviews: LoansPreview[]) => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])

  const sortedLoansPreviews = useMemo(() => {
    if (!sortOption) return loansPreviews

    const [field, order] = sortOption.value

    const sortValueGetter = SORT_VALUE_MAP[field]

    return orderBy(loansPreviews, sortValueGetter, order)
  }, [sortOption, loansPreviews])

  const onChangeSortOption = (option: SortOption<SortField>) => {
    setSortOption(option)
  }

  return {
    sortedLoansPreviews,
    sortParams: {
      option: sortOption,
      onChange: onChangeSortOption,
      options: SORT_OPTIONS,
    },
  }
}
