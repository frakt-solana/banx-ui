import { useMemo } from 'react'

import { Loan } from '@banx/api/core'
import { useLocalStorage } from '@banx/hooks'
import {
  SORT_STORAGE_KEY,
  SortOrder,
  SortValueMap,
  calculateLoanRepayValue,
  createSortParams,
  sortDataByValueMap,
} from '@banx/utils'

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

const DEFAULT_SORT_OPTION = { label: 'LTV', value: `${SortField.LTV}_${SortOrder.ASC}` }

const SORT_VALUE_MAP: SortValueMap<Loan> = {
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
  const [sortOptionValue, setSortOptionValue] = useLocalStorage(
    SORT_STORAGE_KEY.REFINANCE,
    DEFAULT_SORT_OPTION.value,
  )

  const sortedLoans = useMemo(() => {
    return sortDataByValueMap(loans, sortOptionValue, SORT_VALUE_MAP)
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
