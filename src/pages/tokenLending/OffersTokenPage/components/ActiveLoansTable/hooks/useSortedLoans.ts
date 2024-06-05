import { useMemo, useState } from 'react'

import { orderBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { core } from '@banx/api/tokens'

enum SortField {
  LENT = 'lent',
  APR = 'apr',
}

type SortValueGetter = (loan: core.TokenLoan) => number

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'Lent', value: [SortField.LENT, 'desc'] },
  { label: 'APR', value: [SortField.APR, 'desc'] },
]

const SORT_VALUE_MAP: Record<SortField, string | SortValueGetter> = {
  [SortField.LENT]: (loan: core.TokenLoan) => loan.fraktBond.currentPerpetualBorrowed,
  [SortField.APR]: (loan: core.TokenLoan) => loan.bondTradeTransaction.amountOfBonds,
}

export const useSortedLoans = (loans: core.TokenLoan[]) => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])

  const sortedLoans = useMemo(() => {
    if (!sortOption) return loans

    const [field, order] = sortOption.value

    const sortValueGetter = SORT_VALUE_MAP[field]

    return orderBy(loans, sortValueGetter, order)
  }, [sortOption, loans])

  const onChangeSortOption = (option: SortOption<SortField>) => {
    setSortOption(option)
  }

  return {
    sortedLoans,
    sortParams: {
      option: sortOption,
      onChange: onChangeSortOption,
      options: SORT_OPTIONS,
    },
  }
}
