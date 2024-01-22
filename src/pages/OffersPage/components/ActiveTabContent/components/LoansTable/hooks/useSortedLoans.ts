import { useMemo } from 'react'

import { chain } from 'lodash'

import { Loan } from '@banx/api/core'
import { useLocalStorage } from '@banx/hooks'
import {
  SORT_STORAGE_KEY,
  SortOrder,
  SortValueMap,
  calculateLoanRepayValue,
  createSortParams,
  isLoanLiquidated,
  isLoanTerminating,
  sortDataByValueMap,
} from '@banx/utils'

enum SortField {
  LENT = 'lent',
  APR = 'apr',
  LTV = 'ltv',
  STATUS = 'status',
}

const SORT_OPTIONS = [
  { label: 'Lent', value: SortField.LENT },
  { label: 'APR', value: SortField.APR },
  { label: 'LTV', value: SortField.LTV },
  { label: 'Status', value: SortField.STATUS },
]

const DEFAULT_SORT_OPTION = { label: 'LTV', value: `${SortField.LTV}_${SortOrder.DESC}` }

const SORT_VALUE_MAP: SortValueMap<Loan> = {
  [SortField.LENT]: (loan: Loan) => loan.fraktBond.currentPerpetualBorrowed,
  [SortField.APR]: (loan: Loan) => loan.bondTradeTransaction.amountOfBonds,
  [SortField.LTV]: (loan: Loan) => calculateLoanRepayValue(loan) / loan.nft.collectionFloor,
  [SortField.STATUS]: () => null,
}

export const useSortedLoans = (loans: Loan[]) => {
  const [sortOptionValue, setSortOptionValue] = useLocalStorage(
    SORT_STORAGE_KEY.LENDER_LOANS_ACTIVE,
    DEFAULT_SORT_OPTION.value,
  )

  const sortedLoans = useMemo(() => {
    if (!sortOptionValue) return loans

    const [field, order] = sortOptionValue.split('_')

    return field === SortField.STATUS
      ? sortLoansByStatus(loans, order)
      : sortDataByValueMap(loans, sortOptionValue, SORT_VALUE_MAP)
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
