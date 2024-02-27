import { useMemo, useState } from 'react'

import { chain } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue, isLoanLiquidated, isLoanTerminating } from '@banx/utils'

import styles from '../LoansActiveTable.module.less'

enum SortField {
  DEBT = 'debt',
  APR = 'apr',
  LTV = 'ltv',
  STATUS = 'status',
  DURATION = 'duration',
}

type SortOrder = 'asc' | 'desc'
type SortValueGetter = (loan: Loan) => number

type StatusValueMap = Record<SortField, string | SortValueGetter>

const SORT_OPTIONS = [
  { label: 'Debt', value: SortField.DEBT },
  { label: 'APR', value: SortField.APR },
  { label: 'LTV', value: SortField.LTV },
  { label: 'Status', value: SortField.STATUS },
  { label: 'Duration', value: SortField.DURATION },
]

const DEFAULT_SORT_OPTION = { label: 'Status', value: `${SortField.STATUS}_desc` }

const STATUS_VALUE_MAP: StatusValueMap = {
  [SortField.DEBT]: calculateLoanRepayValue,
  [SortField.APR]: (loan) => loan.bondTradeTransaction.amountOfBonds,
  [SortField.LTV]: (loan) => calculateLoanRepayValue(loan) / loan.nft.collectionFloor,
  [SortField.DURATION]: (loan) => loan.fraktBond.activatedAt * -1,
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

export const useSortLoans = (loans: Loan[]) => {
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)
  const sortOptionValue = sortOption?.value

  const sortedLoans = useMemo(() => {
    if (!sortOptionValue) return loans

    const [name, order] = sortOptionValue.split('_') as [SortField, SortOrder]

    return name === SortField.STATUS
      ? sortStatusLoans(loans, order)
      : sortLoansByField(loans, name, order)
  }, [sortOptionValue, loans])

  return {
    sortedLoans,
    sortParams: {
      option: sortOption,
      onChange: setSortOption,
      className: styles.sortDropdown,
      options: SORT_OPTIONS,
    },
  }
}
