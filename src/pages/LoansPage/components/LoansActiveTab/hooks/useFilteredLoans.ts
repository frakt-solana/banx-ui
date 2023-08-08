import { useMemo } from 'react'

import { filter, includes } from 'lodash'

import { Loan } from '@banx/api/loans'

export const useFilteredLoans = (loans: Loan[], selectedOptions: string[]) => {
  const filteredLoans = useMemo(() => {
    if (selectedOptions.length) {
      return filter(loans, (loan) => includes(selectedOptions, loan.nft.collectionName))
    }
    return loans
  }, [loans, selectedOptions])

  return filteredLoans
}
