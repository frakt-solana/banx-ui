import { useMemo, useState } from 'react'

import { chain } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue } from '@banx/utils'

enum SortField {
  DURATION = 'duration',
  FLOOR = 'floorPrice',
  DEBT = 'repayValue',
  LTV = 'ltv',
  APR = 'apr',
  FREEZE = 'freeze',
}

type SortOrder = 'asc' | 'desc'
type SortValueGetter = (loan: Loan) => number

type StatusValueMap = Record<SortField, SortValueGetter>

const SORT_OPTIONS = [
  { label: 'Duration', value: SortField.DURATION },
  { label: 'Floor', value: SortField.FLOOR },
  { label: 'Debt', value: SortField.DEBT },
  { label: 'LTV', value: SortField.LTV },
  { label: 'APR', value: SortField.APR },
  { label: 'Freeze', value: SortField.FREEZE },
]

const DEFAULT_SORT_OPTION = { label: 'LTV', value: `${SortField.LTV}_asc` }

const STATUS_VALUE_MAP: StatusValueMap = {
  [SortField.DURATION]: (loan) => loan.fraktBond.refinanceAuctionStartedAt,
  [SortField.FLOOR]: (loan) => loan.nft.collectionFloor,
  [SortField.DEBT]: (loan) => calculateLoanRepayValue(loan),
  [SortField.APR]: (loan) => loan.bondTradeTransaction.amountOfBonds,
  [SortField.LTV]: (loan) => {
    const repayValue = calculateLoanRepayValue(loan)
    const collectionFloor = loan.nft.collectionFloor

    return repayValue / collectionFloor
  },
  [SortField.FREEZE]: (loan) => loan.bondTradeTransaction.terminationFreeze,
}

export const useSortedLoans = (loans: Loan[]) => {
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)
  const sortOptionValue = sortOption?.value

  const sortedLoans = useMemo(() => {
    if (!sortOptionValue) return loans

    const [field, order] = sortOptionValue.split('_') as [SortField, SortOrder]

    return chain(loans)
      .sortBy((loan) => STATUS_VALUE_MAP[field](loan))
      .thru((sorted) => (order === 'desc' ? sorted.reverse() : sorted))
      .value()
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
