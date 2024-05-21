import { useMemo, useState } from 'react'

import { orderBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { core } from '@banx/api/nft'

import styles from '../RequestLoansTable.module.less'

enum SortField {
  BORROW = 'borrow',
  APR = 'apr',
  LTV = 'ltv',
  FREEZE = 'freeze',
}

type SortValueGetter = (loan: core.Loan) => number

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'Borrow', value: [SortField.BORROW, 'desc'] },
  { label: 'APR', value: [SortField.APR, 'desc'] },
  { label: 'LTV', value: [SortField.LTV, 'desc'] },
  { label: 'Freeze', value: [SortField.FREEZE, 'desc'] },
]

const SORT_VALUE_MAP: Record<SortField, SortValueGetter> = {
  [SortField.BORROW]: (loan) => loan.fraktBond.borrowedAmount,
  [SortField.APR]: (loan) => loan.bondTradeTransaction.amountOfBonds,
  [SortField.LTV]: (loan) => loan.fraktBond.borrowedAmount / loan.nft.collectionFloor,
  [SortField.FREEZE]: (loan) => loan.bondTradeTransaction.terminationFreeze,
}

export const useSortedLoans = (loans: core.Loan[]) => {
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
      className: styles.sortDropdown,
      options: SORT_OPTIONS,
    },
  }
}
