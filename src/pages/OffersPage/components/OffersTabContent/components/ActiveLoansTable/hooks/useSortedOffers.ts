import { useMemo, useState } from 'react'

import { get, isFunction, sortBy } from 'lodash'

import { SortOption } from '@banx/components/SortDropdown'

import { Loan } from '@banx/api/core'
import { LoanStatus, calculateLoanRepayValue, determineLoanStatus } from '@banx/utils'

enum SortField {
  LENT = 'lent',
  APR = 'apr',
  LTV = 'ltv',
  STATUS = 'status',
}

type SortValueGetter = (loan: Loan) => number

export const DEFAULT_SORT_OPTION = { label: 'Status', value: 'status_asc' }

export const SORT_OPTIONS = [
  { label: 'Lent', value: 'lent' },
  { label: 'APR', value: 'apr' },
  { label: 'LTV', value: 'ltv' },
  { label: 'Status', value: 'status' },
]

export const useSortedLenderLoans = (loans: Loan[]) => {
  const [sortOption, setSortOption] = useState<SortOption>(DEFAULT_SORT_OPTION)

  const sortOptionValue = sortOption?.value

  const sortedLoans = useMemo(() => {
    if (!sortOptionValue) {
      return loans
    }

    const [name, order] = sortOptionValue.split('_')

    const sortValueMapping: Record<SortField, string | SortValueGetter> = {
      [SortField.LENT]: 'fraktBond.currentPerpetualBorrowed',
      [SortField.APR]: 'bondTradeTransaction.amountOfBonds',
      [SortField.LTV]: (loan) => {
        const collectionFloor = loan.nft.collectionFloor
        const repayValue = calculateLoanRepayValue(loan)

        return repayValue / collectionFloor
      },
      [SortField.STATUS]: (loan) => {
        const loanStatus = determineLoanStatus(loan)
        const statusToNumber = {
          [LoanStatus.Liquidated]: 1,
          [LoanStatus.Terminating]: 2,
        }

        return statusToNumber[loanStatus as keyof typeof statusToNumber] || 3
      },
    }

    const sorted = sortBy(loans, (loan) => {
      const sortValue = sortValueMapping[name as SortField]
      return isFunction(sortValue) ? sortValue(loan) : get(loan, sortValue)
    })

    return order === 'desc' ? sorted.reverse() : sorted
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
