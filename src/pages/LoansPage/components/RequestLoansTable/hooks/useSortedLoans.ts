import { useMemo, useState } from 'react'

import { chain } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue } from '@banx/utils'

import styles from '../RequestLoansTable.module.less'

enum SortField {
  BORROW = 'borrow',
  APR = 'apr',
  LTV = 'ltv',
  FREEZE = 'freeze',
}

type SortOrder = 'asc' | 'desc'
type SortValueGetter = (loan: Loan) => number

type StatusValueMap = Record<SortField, SortValueGetter>

const SORT_OPTIONS = [
  { label: 'Borrow', value: SortField.BORROW },
  { label: 'APR', value: SortField.APR },
  { label: 'LTV', value: SortField.LTV },
  { label: 'Freeze', value: SortField.FREEZE },
]

const DEFAULT_SORT_OPTION = { label: 'Borrow', value: `${SortField.BORROW}_desc` }

const STATUS_VALUE_MAP: StatusValueMap = {
  [SortField.BORROW]: calculateLoanRepayValue,
  [SortField.APR]: (loan) => loan.bondTradeTransaction.amountOfBonds,
  [SortField.LTV]: (loan) => calculateLoanRepayValue(loan) / loan.nft.collectionFloor,
  [SortField.FREEZE]: (loan) => loan.bondTradeTransaction.terminationFreeze,
}

export const useSortedLoans = (loans: Loan[]) => {
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)
  const sortOptionValue = sortOption?.value

  const sortedLoans = useMemo(() => {
    if (!sortOptionValue) return loans

    const [field, order] = sortOptionValue.split('_') as [SortField, SortOrder]

    return chain(loans)
      .sortBy((loan) => STATUS_VALUE_MAP[field](loan))
      .thru((sorted) => (order === 'desc' ? sorted.reverse() : sorted))
      .value()
  }, [sortOptionValue, loans])

  return {
    sortedLoans,
    sortParams: {
      option: sortOption,
      onChange: setSortOption,
      className: styles.sortDropdown,
      options: SORT_OPTIONS,
    },
  }
}
