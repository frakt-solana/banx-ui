import { useMemo, useState } from 'react'

import { chain, orderBy } from 'lodash'

import { SortOption, SortOrder } from '@banx/components/SortDropdown'

import { core } from '@banx/api/tokens'
import {
  caclulateBorrowTokenLoanValue,
  calculateTokenLoanLtvByLoanValue,
  isTokenLoanLiquidated,
  isTokenLoanTerminating,
} from '@banx/utils'

enum SortField {
  LTV = 'ltv',
  LENT = 'lent',
  APR = 'apr',
  STATUS = 'status',
}

type SortValueGetter = (loan: core.TokenLoan) => number

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'LTV', value: [SortField.LTV, 'desc'] },
  { label: 'Lent', value: [SortField.LENT, 'desc'] },
  { label: 'APR', value: [SortField.APR, 'desc'] },
  { label: 'Status', value: [SortField.STATUS, 'desc'] },
]

const SORT_VALUE_MAP: Record<SortField, string | SortValueGetter> = {
  [SortField.LTV]: (loan: core.TokenLoan) => {
    const debtValue = caclulateBorrowTokenLoanValue(loan).toNumber()
    return calculateTokenLoanLtvByLoanValue(loan, debtValue)
  },
  [SortField.LENT]: (loan: core.TokenLoan) => loan.fraktBond.currentPerpetualBorrowed,
  [SortField.APR]: (loan: core.TokenLoan) => loan.bondTradeTransaction.amountOfBonds,
  [SortField.STATUS]: '',
}

const sortLoansByStatus = (loans: core.TokenLoan[], order: SortOrder) => {
  const terminatingLoans = chain(loans)
    .filter(isTokenLoanTerminating)
    .sortBy((loan) => loan.fraktBond.refinanceAuctionStartedAt)
    .reverse()
    .value()

  const otherLoans = chain(loans)
    .filter((loan) => !isTokenLoanTerminating(loan) && !isTokenLoanLiquidated(loan))
    .sortBy((loan) => loan.fraktBond.activatedAt)
    .reverse()
    .value()

  const combinedLoans = [...otherLoans, ...terminatingLoans]

  return order === 'asc' ? combinedLoans : combinedLoans.reverse()
}

export const useSortedLoans = (loans: core.TokenLoan[]) => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])

  const sortedLoans = useMemo(() => {
    if (!sortOption) return loans

    const [field, order] = sortOption.value

    const sortValueGetter = SORT_VALUE_MAP[field]

    return field === SortField.STATUS
      ? sortLoansByStatus(loans, order)
      : orderBy(loans, sortValueGetter, order)
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
