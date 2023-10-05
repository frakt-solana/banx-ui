import { useMemo } from 'react'

import { get, isFunction, sortBy } from 'lodash'

import { Loan } from '@banx/api/core'
import { LoanStatus, calculateLoanRepayValue, determineLoanStatus } from '@banx/utils'

enum SortField {
  BORROWED = 'loanValue',
  DEBT = 'repayValue',
  HEALTH = 'health',
  STATUS = 'status',
}

type SortValueGetter = (loan: Loan) => number

export const useSortedLoans = (loans: Loan[], sortOptionValue: string) => {
  const sortedLoans = useMemo(() => {
    if (!sortOptionValue) {
      return loans
    }

    const [name, order] = sortOptionValue.split('_')

    const sortValueMapping: Record<SortField, string | SortValueGetter> = {
      [SortField.BORROWED]: 'fraktBond.borrowedAmount',
      [SortField.DEBT]: (loan) => {
        return calculateLoanRepayValue(loan)
      },
      [SortField.HEALTH]: (loan) => {
        const collectionFloor = loan.nft.collectionFloor
        const repayValue = calculateLoanRepayValue(loan)

        return collectionFloor / repayValue
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

    if (name === SortField.STATUS) {
      return order === 'desc' ? sorted : sorted.reverse()
    }

    return order === 'desc' ? sorted.reverse() : sorted
  }, [sortOptionValue, loans])

  return sortedLoans
}
