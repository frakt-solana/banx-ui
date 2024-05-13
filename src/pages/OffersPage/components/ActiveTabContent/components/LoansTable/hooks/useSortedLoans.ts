import { useMemo, useState } from 'react'

import { chain, orderBy } from 'lodash'

import { SortOption, SortOrder } from '@banx/components/SortDropdown'

import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue, isLoanLiquidated, isLoanTerminating } from '@banx/utils'

enum SortField {
  LTV = 'ltv',
  LENT = 'lent',
  RARITY = 'rarity',
  APR = 'apr',
  STATUS = 'status',
}

type SortValueGetter = (loan: Loan) => number

const SORT_OPTIONS: SortOption<SortField>[] = [
  { label: 'LTV', value: [SortField.LTV, 'desc'] },
  { label: 'Lent', value: [SortField.LENT, 'desc'] },
  { label: 'Rarity', value: [SortField.RARITY, 'desc'] },
  { label: 'APR', value: [SortField.APR, 'desc'] },
  { label: 'Status', value: [SortField.STATUS, 'desc'] },
]

const SORT_VALUE_MAP: Record<SortField, string | SortValueGetter> = {
  [SortField.LENT]: (loan: Loan) => loan.fraktBond.currentPerpetualBorrowed,
  [SortField.RARITY]: (loan) => loan.nft.rarity?.rank || 0,
  [SortField.APR]: (loan: Loan) => loan.bondTradeTransaction.amountOfBonds,
  [SortField.LTV]: (loan: Loan) => calculateLoanRepayValue(loan) / loan.nft.collectionFloor,
  [SortField.STATUS]: '',
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
