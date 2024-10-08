import { useMemo, useState } from 'react'

import { chain, orderBy } from 'lodash'

import { SortOrder } from '@banx/components/SortDropdown'

import { TokenLoan } from '@banx/api/tokens'
import {
  caclulateBorrowTokenLoanValue,
  calculateTokenLoanLtvByLoanValue,
  isTokenLoanLiquidated,
  isTokenLoanRepaymentCallActive,
  isTokenLoanTerminating,
} from '@banx/utils'

import { TableColumnKey } from '../constants'

export type SortColumnOption<T> = { key: T; order: SortOrder }

type SortValueGetter = (loan: TokenLoan) => number

const SORT_OPTIONS: SortColumnOption<TableColumnKey>[] = [
  { key: TableColumnKey.STATUS, order: 'desc' },
  { key: TableColumnKey.APR, order: 'desc' },
  { key: TableColumnKey.DEBT, order: 'desc' },
  { key: TableColumnKey.DURATION, order: 'desc' },
  { key: TableColumnKey.LTV, order: 'desc' },
]

const SORT_VALUE_MAP: Record<TableColumnKey, string | SortValueGetter> = {
  [TableColumnKey.APR]: (loan) => loan.bondTradeTransaction.amountOfBonds,
  [TableColumnKey.DEBT]: (loan) => caclulateBorrowTokenLoanValue(loan).toNumber(),
  [TableColumnKey.DURATION]: (loan) => loan.fraktBond.activatedAt * -1,
  [TableColumnKey.LTV]: (loan) => {
    const debtValue = caclulateBorrowTokenLoanValue(loan).toNumber()
    return calculateTokenLoanLtvByLoanValue(loan, debtValue)
  },
  [TableColumnKey.STATUS]: '',
}

const sortStatusLoans = (loans: TokenLoan[], order: SortOrder) => {
  const terminatingLoans = chain(loans)
    .filter(isTokenLoanTerminating)
    .sortBy((loan) => loan.fraktBond.refinanceAuctionStartedAt)
    .reverse()
    .value()

  const repaymentCallLoans = chain(loans)
    .filter(isTokenLoanRepaymentCallActive)
    .sortBy((loan) => loan.bondTradeTransaction.repaymentCallAmount)
    .reverse()
    .value()

  const otherLoans = chain(loans)
    .filter(
      (loan) =>
        !isTokenLoanTerminating(loan) &&
        !isTokenLoanLiquidated(loan) &&
        !isTokenLoanRepaymentCallActive(loan),
    )
    .sortBy((loan) => loan.fraktBond.activatedAt)
    .reverse()
    .value()

  const combinedLoans = [...otherLoans, ...repaymentCallLoans, ...terminatingLoans]

  return order === 'asc' ? combinedLoans : combinedLoans.reverse()
}

export const useSortedLoans = (loans: TokenLoan[]) => {
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0])

  const sortedLoans = useMemo(() => {
    if (!sortOption) return loans

    const { key, order } = sortOption

    const sortValueGetter = SORT_VALUE_MAP[key]

    return key === TableColumnKey.STATUS
      ? sortStatusLoans(loans, order)
      : orderBy(loans, sortValueGetter, order)
  }, [sortOption, loans])

  const onChangeSortOption = (option: SortColumnOption<TableColumnKey>) => {
    setSortOption(option)
  }

  return {
    sortedLoans,
    selectedSortOption: sortOption,
    onChangeSortOption,
  }
}
