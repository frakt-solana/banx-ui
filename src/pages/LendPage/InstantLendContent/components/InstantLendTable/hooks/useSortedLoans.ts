import { useMemo } from 'react'

import { get, isFunction, sortBy } from 'lodash'

import { Loan } from '@banx/api/core'
import { calculateLoanRepayValue } from '@banx/utils'

enum SortField {
  DURATION = 'duration',
  FLOOR = 'floorPrice',
  DEBT = 'repayValue',
  LTV = 'ltv',
  APR = 'apr',
}

type SortValueGetter = (loan: Loan) => number

export const useSortedLoans = (loans: Loan[], sortOptionValue: string) => {
  const sortedLoans = useMemo(() => {
    if (!sortOptionValue) {
      return loans
    }

    const [name, order] = sortOptionValue.split('_')

    const sortValueMapping: Record<SortField, string | SortValueGetter> = {
      [SortField.DURATION]: (loan) => loan.fraktBond.refinanceAuctionStartedAt,
      [SortField.FLOOR]: (loan) => loan.nft.collectionFloor,
      [SortField.DEBT]: (loan) => calculateLoanRepayValue(loan),
      [SortField.APR]: (loan) => loan.bondTradeTransaction.amountOfBonds,
      [SortField.LTV]: (loan) => {
        const repayValue = calculateLoanRepayValue(loan)
        const collectionFloor = loan.nft.collectionFloor

        return repayValue / collectionFloor
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
