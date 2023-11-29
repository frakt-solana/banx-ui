import { useMemo } from 'react'

import { get, isFunction, sortBy } from 'lodash'

import { Loan } from '@banx/api/core'
import { LoanStatus, calculateLoanRepayValue, determineLoanStatus } from '@banx/utils'

enum SortField {
  LENT = 'lent',
  APR = 'apy',
  LTV = 'ltv',
  STATUS = 'status',
}

type SortValueGetter = (loan: Loan) => number

export const useSortedLenderLoans = (loans: Loan[], sortOptionValue: string) => {
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

  return sortedLoans
}
