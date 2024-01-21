import { useMemo } from 'react'

import { chain } from 'lodash'

import { Loan } from '@banx/api/core'
import { createSortParams, useSort } from '@banx/store'
import { calculateLoanRepayValue, isLoanLiquidated, isLoanTerminating } from '@banx/utils'

enum SortField {
  LENT = 'lent',
  APR = 'apr',
  LTV = 'ltv',
  STATUS = 'status',
}

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

type SortValueGetter = (loan: Loan) => number | null
type StatusValueMap = Record<string, SortValueGetter>

export const SORT_OPTIONS = [
  { label: 'Lent', value: SortField.LENT },
  { label: 'APR', value: SortField.APR },
  { label: 'LTV', value: SortField.LTV },
  { label: 'Status', value: SortField.STATUS },
]

export const DEFAULT_SORT_OPTION = { label: 'LTV', value: `${SortField.LTV}_${SortOrder.DESC}` }

const STATUS_VALUE_MAP: StatusValueMap = {
  [SortField.LENT]: (loan: Loan) => loan.fraktBond.currentPerpetualBorrowed,
  [SortField.APR]: (loan: Loan) => loan.bondTradeTransaction.amountOfBonds,
  [SortField.LTV]: (loan: Loan) => calculateLoanRepayValue(loan) / loan.nft.collectionFloor,
  [SortField.STATUS]: () => null,
}

const sortLoansByField = (loans: Loan[], field: string, order: string) => {
  return chain(loans)
    .sortBy((loan) => STATUS_VALUE_MAP[field](loan))
    .thru((sorted) => (order === 'desc' ? sorted.reverse() : sorted))
    .value()
}

const sortLoansByStatus = (loans: Loan[], order: string) => {
  const terminatingLoans = chain(loans)
    .filter(isLoanTerminating)
    .sortBy((loan) => loan.fraktBond.refinanceAuctionStartedAt)
    .reverse()
    .value()

  const otherLoans = chain(loans)
    .filter((loan) => !isLoanTerminating(loan) && !isLoanLiquidated(loan))
    .sortBy((loan) => loan.fraktBond.activatedAt)
    .reverse()
    .value()

  const combinedLoans = [...otherLoans, ...terminatingLoans]

  return order === 'asc' ? combinedLoans : combinedLoans.reverse()
}

const SORT_STORAGE_KEY = '@banx.sort.loans'

export const useSortedLoans = (loans: Loan[]) => {
  const { value: defaultOptionValue } = DEFAULT_SORT_OPTION
  const { sortOptionValue, setSortOptionValue } = useSort(SORT_STORAGE_KEY, defaultOptionValue)

  const sortedLoans = useMemo(() => {
    if (!sortOptionValue) {
      return loans
    }

    const [field, order] = sortOptionValue.split('_')

    return field === SortField.STATUS
      ? sortLoansByStatus(loans, order)
      : sortLoansByField(loans, field, order)
  }, [sortOptionValue, loans])

  const sortParams = useMemo(() => {
    return createSortParams({
      sortOptionValue,
      setSortOptionValue,
      defaultOption: DEFAULT_SORT_OPTION,
      options: SORT_OPTIONS,
    })
  }, [setSortOptionValue, sortOptionValue])

  return { sortedLoans, sortParams }
}
