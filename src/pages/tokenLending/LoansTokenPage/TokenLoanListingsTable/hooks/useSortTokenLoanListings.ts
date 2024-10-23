import { useMemo, useState } from 'react'

import { orderBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { TokenLoan } from '@banx/api/tokens'
import { calculateTokenLoanLtvByLoanValue } from '@banx/utils'

enum SortField {
  BORROW = 'borrow',
  APR = 'apr',
  LTV = 'ltv',
  FREEZE = 'freeze',
}

type SortValueGetter = (loan: TokenLoan) => number

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'Borrow', value: [SortField.BORROW, 'desc'] },
  { label: 'APR', value: [SortField.APR, 'desc'] },
  { label: 'LTV', value: [SortField.LTV, 'desc'] },
  { label: 'Freeze', value: [SortField.FREEZE, 'desc'] },
]

const SORT_VALUE_MAP: Record<SortField, SortValueGetter> = {
  [SortField.BORROW]: (loan) => loan.fraktBond.borrowedAmount,
  [SortField.APR]: (loan) => loan.bondTradeTransaction.amountOfBonds,
  [SortField.LTV]: (loan) => calculateTokenLoanLtvByLoanValue(loan, loan.fraktBond.borrowedAmount),
  [SortField.FREEZE]: (loan) => loan.bondTradeTransaction.terminationFreeze,
}

export const useSortTokenLoanListings = (loans: TokenLoan[]) => {
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
