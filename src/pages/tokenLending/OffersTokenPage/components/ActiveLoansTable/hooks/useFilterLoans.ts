import { useMemo } from 'react'

import { core } from '@banx/api/tokens'
import { createGlobalState } from '@banx/store'

const useCollectionsStore = createGlobalState<string[]>([])

export const useFilterLoans = (loans: core.TokenLoan[]) => {
  const [selectedCollections, setSelectedCollections] = useCollectionsStore()

  const filteredLoansByCollection = useMemo(() => {
    if (selectedCollections.length) {
      return loans.filter(({ collateral }) => selectedCollections.includes(collateral.ticker))
    }
    return loans
  }, [loans, selectedCollections])

  return {
    filteredLoans: filteredLoansByCollection,
    filteredAllLoans: loans,

    selectedCollections,
    setSelectedCollections,
  }
}
