import { useMemo, useState } from 'react'

import { filter, size } from 'lodash'

import { Loan } from '@banx/api/core'
import { isLoanTerminating } from '@banx/utils'

export const useFilterLoans = (loans: Loan[]) => {
  const [isTerminationFilterEnabled, setTerminationFilterState] = useState(false)
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])

  const toggleTerminationFilter = () => {
    setTerminationFilterState(!isTerminationFilterEnabled)
  }

  const filteredLoansBySelectedCollections = useMemo(() => {
    if (!selectedCollections.length) return loans

    return filter(loans, ({ nft }) => selectedCollections.includes(nft.meta.collectionName))
  }, [loans, selectedCollections])

  const { filteredLoansBySelectedCollection, filteredAllLoans } = useMemo(() => {
    const applyTerminationFilter = (loans: Loan[]) =>
      isTerminationFilterEnabled ? filter(loans, isLoanTerminating) : loans

    return {
      filteredLoansBySelectedCollection: applyTerminationFilter(filteredLoansBySelectedCollections),
      filteredAllLoans: applyTerminationFilter(loans),
    }
  }, [filteredLoansBySelectedCollections, loans, isTerminationFilterEnabled])

  const countOfTerminatingLoans = useMemo(
    () => size(filter(filteredLoansBySelectedCollections, isLoanTerminating)) || null,
    [filteredLoansBySelectedCollections],
  )

  return {
    filteredLoansBySelectedCollection,
    filteredAllLoans,

    countOfTerminatingLoans,

    isTerminationFilterEnabled,
    toggleTerminationFilter,

    selectedCollections,
    setSelectedCollections,
  }
}
