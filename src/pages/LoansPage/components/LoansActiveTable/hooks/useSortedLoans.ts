import { useMemo } from 'react'

import { chain } from 'lodash'

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

type StatusValueMap = Record<SortField, string | SortValueGetter>

const STATUS_VALUE_MAP: StatusValueMap = {
  [SortField.BORROWED]: calcLoanBorrowedAmount,
  [SortField.DEBT]: calculateLoanRepayValue,
  [SortField.HEALTH]: (loan: Loan) => loan.nft.collectionFloor / calculateLoanRepayValue(loan),
  [SortField.STATUS]: '',
}

const sortLoansByField = (loans: Loan[], field: SortField, order: SortOrder) => {
  return chain(loans)
    .sortBy((loan) => (STATUS_VALUE_MAP[field] as SortValueGetter)(loan))
    .thru((sorted) => (order === 'desc' ? sorted.reverse() : sorted))
    .value()
}

const sortStatusLoans = (loans: Loan[], order: SortOrder) => {
  const terminatingLoans = chain(loans)
    .filter(isLoanTerminating)
    .sortBy('fraktBond.refinanceAuctionStartedAt')
    .reverse()
    .value()

  const otherLoans = chain(loans)
    .filter((loan) => !isLoanTerminating(loan) && !isLoanLiquidated(loan))
    .sortBy('fraktBond.activatedAt')
    .reverse()
    .value()

  const combinedLoans = [...otherLoans, ...terminatingLoans]

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
