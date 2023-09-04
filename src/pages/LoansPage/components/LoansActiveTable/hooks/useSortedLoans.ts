import { useMemo } from 'react'

import { get, sortBy } from 'lodash'

import { Loan } from '@banx/api/core'

enum SortField {
  BORROWED = 'loanValue',
  DEBT = 'repayValue',
  DURATION = 'duration',
}

export const useSortedLoans = (loans: Loan[], sortOptionValue: string) => {
  const sortedLoans = useMemo(() => {
    if (!sortOptionValue) {
      return loans
    }

    const [name, order] = sortOptionValue.split('_')

    const sortValueMapping: Record<SortField, string> = {
      [SortField.BORROWED]: 'loanValue',
      [SortField.DEBT]: 'repayValue',
      [SortField.DURATION]: 'bondParams.expiredAt',
    }

    const sorted = sortBy(loans, (loan) => {
      const sortValue = sortValueMapping[name as SortField]
      return get(loan, sortValue)
    })

    return order === 'desc' ? sorted.reverse() : sorted
  }, [sortOptionValue, loans])

  return sortedLoans
}
