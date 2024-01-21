import { useMemo } from 'react'

import { chain } from 'lodash'

import { Loan } from '@banx/api/core'
import { useLocalStorage } from '@banx/hooks'
import { SORT_STORAGE_KEY, calculateLoanRepayValue, createSortParams } from '@banx/utils'

import { calculateAprIncrement } from './../helpers'

export enum SortField {
  FLOOR = 'floorPrice',
  DEBT = 'repayValue',
  LTV = 'ltv',
  APR = 'apr',
  DURATION = 'duration',
}

const SORT_OPTIONS = [
  { label: 'Floor', value: SortField.FLOOR },
  { label: 'Debt', value: SortField.DEBT },
  { label: 'LTV', value: SortField.LTV },
  { label: 'APR', value: SortField.APR },
  { label: 'Ends in', value: SortField.DURATION },
]

const DEFAULT_SORT_OPTION = { label: 'LTV', value: `${SortField.LTV}_asc` }

type SortValueGetter = (loan: Loan) => number
type StatusValueMap = Record<string, SortValueGetter>

const STATUS_VALUE_MAP: StatusValueMap = {
  [SortField.DURATION]: (loan) => loan.fraktBond.refinanceAuctionStartedAt,
  [SortField.FLOOR]: (loan) => loan.nft.collectionFloor,
  [SortField.DEBT]: (loan) => calculateLoanRepayValue(loan),
  [SortField.APR]: (loan) => calculateAprIncrement(loan),
  [SortField.LTV]: (loan) => {
    const repayValue = calculateLoanRepayValue(loan)
    return repayValue / loan.nft.collectionFloor
  },
}

export const useSortedLoans = (loans: Loan[]) => {
  const { value: defaultOptionValue } = DEFAULT_SORT_OPTION
  const [sortOptionValue, setSortOptionValue] = useLocalStorage(
    SORT_STORAGE_KEY.REFINANCE,
    defaultOptionValue,
  )

  const sortedLoans = useMemo(() => {
    if (!sortOptionValue) return loans

    const [field, order] = sortOptionValue.split('_')

    return chain(loans)
      .sortBy((loan) => STATUS_VALUE_MAP[field](loan))
      .thru((sorted) => (order === 'desc' ? sorted.reverse() : sorted))
      .value()
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
