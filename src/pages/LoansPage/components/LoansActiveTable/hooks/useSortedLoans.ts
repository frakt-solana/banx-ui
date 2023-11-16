import { useMemo } from 'react'

import { get, isFunction, sortBy } from 'lodash'

import { Loan } from '@banx/api/core'
import {
  calcLoanBorrowedAmount,
  calculateLoanRepayValue,
  isLoanLiquidated,
  isLoanTerminating,
} from '@banx/utils'

enum SortField {
  BORROWED = 'loanValue',
  DEBT = 'repayValue',
  HEALTH = 'health',
  STATUS = 'status',
}

type SortOrder = 'asc' | 'desc'
type SortValueGetter = (loan: Loan) => number

const STATUS_VALUE_MAP: Record<SortField, string | SortValueGetter> = {
  [SortField.BORROWED]: calcLoanBorrowedAmount,
  [SortField.DEBT]: calculateLoanRepayValue,
  [SortField.HEALTH]: (loan: Loan) => loan.nft.collectionFloor / calculateLoanRepayValue(loan),
  [SortField.STATUS]: '',
}

const sortLoansByField = (loans: Loan[], field: SortField, order: SortOrder) => {
  const sorted = sortBy(loans, (loan) => {
    const sortValue = STATUS_VALUE_MAP[field]
    return isFunction(sortValue) ? sortValue(loan) : get(loan, sortValue)
  })

  return order === 'desc' ? sorted.reverse() : sorted
}

const sortStatusLoans = (loans: Loan[], order: SortOrder) => {
  const terminatingLoans = loans.filter(isLoanTerminating)
  const sortedTerminatingLoans = sortBy(
    terminatingLoans,
    'fraktBond.refinanceAuctionStartedAt',
  ).reverse()

  const otherLoans = loans.filter((loan) => !isLoanTerminating(loan) && !isLoanLiquidated(loan))
  const finalSortedOtherLoans = sortBy(otherLoans, 'fraktBond.activatedAt').reverse()
  const combinedLoans = [...finalSortedOtherLoans, ...sortedTerminatingLoans]

  return order === 'asc' ? combinedLoans : combinedLoans.reverse()
}

export const useSortedLoans = (loans: Loan[], sortOptionValue: string) => {
  const sortedLoans = useMemo(() => {
    if (!sortOptionValue) {
      return loans
    }

    const [name, order] = sortOptionValue.split('_') as [SortField, SortOrder]

    return name === SortField.STATUS
      ? sortStatusLoans(loans, order)
      : sortLoansByField(loans, name, order)
  }, [sortOptionValue, loans])

  return sortedLoans
}
