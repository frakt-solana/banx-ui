import { useMemo, useState } from 'react'

import { core } from '@banx/api/tokens'
import { createGlobalState } from '@banx/store'
import { isTokenLoanUnderWater } from '@banx/utils'

const useCollectionsStore = createGlobalState<string[]>([])

export const useFilterLoans = (loans: core.TokenLoan[]) => {
  const [isUnderwaterFilterActive, setIsUnderwaterFilterActive] = useState(false)
  const [selectedCollections, setSelectedCollections] = useCollectionsStore()

  const filteredLoansByCollection = useMemo(() => {
    if (selectedCollections.length) {
      return loans.filter(({ collateral }) => selectedCollections.includes(collateral.ticker))
    }
    return loans
  }, [loans, selectedCollections])

  const underwaterLoans = useMemo(
    () => filteredLoansByCollection.filter(isTokenLoanUnderWater),
    [filteredLoansByCollection],
  )

  const onToggleUnderwaterFilter = () => {
    setIsUnderwaterFilterActive(!isUnderwaterFilterActive)
  }

  const { filteredLoans, filteredAllLoans } = useMemo(() => {
    const applyFilter = (loans: core.TokenLoan[]) =>
      isUnderwaterFilterActive ? underwaterLoans : loans

    return {
      filteredLoans: applyFilter(filteredLoansByCollection),
      filteredAllLoans: applyFilter(loans),
    }
  }, [isUnderwaterFilterActive, underwaterLoans, filteredLoansByCollection, loans])

  const underwaterLoansCount = underwaterLoans.length > 0 ? underwaterLoans.length : null

  return {
    filteredLoans,
    filteredAllLoans,

    underwaterLoansCount,

    isUnderwaterFilterActive,
    onToggleUnderwaterFilter,

    selectedCollections,
    setSelectedCollections,
  }
}
