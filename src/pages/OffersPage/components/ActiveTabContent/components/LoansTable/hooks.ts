import { useMemo, useState } from 'react'

import { chain } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue, isLoanLiquidated, isLoanTerminating } from '@banx/utils'

enum SortField {
  LENT = 'lent',
  APR = 'apr',
  LTV = 'ltv',
  STATUS = 'status',
}

type SortOrder = 'asc' | 'desc'
type SortValueGetter = (loan: Loan) => number
type StatusValueMap = Record<SortField, string | SortValueGetter>

const SORT_OPTIONS = [
  { label: 'Lent', value: 'lent' },
  { label: 'APR', value: 'apr' },
  { label: 'LTV', value: 'ltv' },
  { label: 'Status', value: 'status' },
]

const DEFAULT_SORT_OPTION = { label: 'Status', value: 'status_desc' }

const STATUS_VALUE_MAP: StatusValueMap = {
  [SortField.LENT]: (loan: Loan) => loan.fraktBond.currentPerpetualBorrowed,
  [SortField.APR]: (loan: Loan) => loan.bondTradeTransaction.amountOfBonds,
  [SortField.LTV]: (loan: Loan) => loan.nft.collectionFloor / calculateLoanRepayValue(loan),
  [SortField.STATUS]: '',
}

const sortLoansByField = (loans: Loan[], field: SortField, order: SortOrder) => {
  return chain(loans)
    .sortBy((loan) => (STATUS_VALUE_MAP[field] as SortValueGetter)(loan))
    .thru((sorted) => (order === 'desc' ? sorted.reverse() : sorted))
    .value()
}

const sortLoansByStatus = (loans: Loan[], order: SortOrder) => {
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

export const useSortedLoans = (loans: Loan[]) => {
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const sortOptionValue = sortOption?.value

  const sortedLoans = useMemo(() => {
    if (!sortOptionValue) {
      return loans
    }

    const [name, order] = sortOptionValue.split('_') as [SortField, SortOrder]

    return name === SortField.STATUS
      ? sortLoansByStatus(loans, order)
      : sortLoansByField(loans, name, order)
  }, [sortOptionValue, loans])

  return {
    sortedLoans,
    sortParams: {
      option: sortOption,
      onChange: setSortOption,
      options: SORT_OPTIONS,
    },
  }
}
