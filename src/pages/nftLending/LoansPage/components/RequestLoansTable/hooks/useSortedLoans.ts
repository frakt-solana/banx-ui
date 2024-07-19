import { useMemo, useState } from 'react'

import { orderBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { coreNew } from '@banx/api/nft'

import styles from '../RequestLoansTable.module.less'

enum SortField {
  BORROW = 'borrow',
  APR = 'apr',
  LTV = 'ltv',
  FREEZE = 'freeze',
}

type SortValueGetter = (loan: coreNew.Loan) => number

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'Borrow', value: [SortField.BORROW, 'desc'] },
  { label: 'APR', value: [SortField.APR, 'desc'] },
  { label: 'LTV', value: [SortField.LTV, 'desc'] },
  { label: 'Freeze', value: [SortField.FREEZE, 'desc'] },
]

const SORT_VALUE_MAP: Record<SortField, SortValueGetter> = {
  [SortField.BORROW]: (loan) => loan.fraktBond.borrowedAmount.toNumber(),
  [SortField.APR]: (loan) => loan.bondTradeTransaction.amountOfBonds.toNumber(),
  [SortField.LTV]: (loan) =>
    loan.fraktBond.borrowedAmount.toNumber() / loan.nft.collectionFloor.toNumber(),
  [SortField.FREEZE]: (loan) => loan.bondTradeTransaction.terminationFreeze.toNumber(),
}

export const useSortedLoans = (loans: coreNew.Loan[]) => {
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
