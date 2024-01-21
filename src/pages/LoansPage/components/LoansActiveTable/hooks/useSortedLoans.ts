import { useMemo } from 'react'

import { useLocalStorage } from '@solana/wallet-adapter-react'
import { chain } from 'lodash'

import { Loan } from '@banx/api/core'
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
  DEBT = 'debt',
  APR = 'apr',
  LTV = 'ltv',
  STATUS = 'status',
}

const SORT_OPTIONS = [
  { label: 'Debt', value: SortField.DEBT },
  { label: 'APR', value: SortField.APR },
  { label: 'LTV', value: SortField.LTV },
  { label: 'Status', value: SortField.STATUS },
]
const DEFAULT_SORT_OPTION = { label: 'LTV', value: `${SortField.STATUS}_${SortOrder.DESC}` }

const SORT_VALUE_MAP: SortValueMap<Loan> = {
  [SortField.DEBT]: (loan) => calculateLoanRepayValue(loan),
  [SortField.APR]: (loan) => loan.bondTradeTransaction.amountOfBonds,
  [SortField.LTV]: (loan) => calculateLoanRepayValue(loan) / loan.nft.collectionFloor,
  [SortField.STATUS]: () => null,
}

export const useSortedLoans = (loans: Loan[]) => {
  const [sortOptionValue, setSortOptionValue] = useLocalStorage(
    SORT_STORAGE_KEY.LOANS_ACTIVE,
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
