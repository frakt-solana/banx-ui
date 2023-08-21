import { useMemo } from 'react'

import { filter, includes } from 'lodash'

import { Loan } from '@banx/api/core'

export const useFilteredLoans = (loans: Loan[], selectedOptions: string[]) => {
  const filteredLoans = useMemo(() => {
    if (selectedOptions.length) {
      return filter(loans, ({ nft }) => includes(selectedOptions, nft.meta.collectionName))
    }
    return loans
  }, [loans, selectedOptions])

  return filteredLoans
}
