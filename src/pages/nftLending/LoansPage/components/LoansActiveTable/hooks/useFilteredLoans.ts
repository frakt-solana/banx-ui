import { useMemo, useState } from 'react'

import { filter, size } from 'lodash'

import { core } from '@banx/api/nft'
import { createGlobalState } from '@banx/store'
import { isLoanRepaymentCallActive, isLoanTerminating } from '@banx/utils'

const useCollectionsStore = createGlobalState<string[]>([])

export const useFilterLoans = (loans: core.Loan[]) => {
  const [isTerminationFilterEnabled, setTerminationFilterState] = useState(false)
  const [isRepaymentCallFilterEnabled, setIsRepaymentCallFilterState] = useState(false)

  const [selectedCollections, setSelectedCollections] = useCollectionsStore()

  const toggleTerminationFilter = () => {
    setIsRepaymentCallFilterState(false)
    setTerminationFilterState(!isTerminationFilterEnabled)
  }

  const toggleRepaymentCallFilter = () => {
    setTerminationFilterState(false)
    setIsRepaymentCallFilterState(!isRepaymentCallFilterEnabled)
  }

  const filteredLoansBySelectedCollections = useMemo(() => {
    if (!selectedCollections.length) return loans

    return filter(loans, ({ nft }) => selectedCollections.includes(nft.meta.collectionName))
  }, [loans, selectedCollections])

  const { filteredLoansBySelectedCollection, filteredAllLoans } = useMemo(() => {
    const applyFilter = (loans: core.Loan[]) => {
      if (isTerminationFilterEnabled) return filter(loans, isLoanTerminating)
      if (isRepaymentCallFilterEnabled) return filter(loans, isLoanRepaymentCallActive)
      return loans
    }

    return {
      filteredLoansBySelectedCollection: applyFilter(filteredLoansBySelectedCollections),
      filteredAllLoans: applyFilter(loans),
    }
  }, [
    filteredLoansBySelectedCollections,
    loans,
    isTerminationFilterEnabled,
    isRepaymentCallFilterEnabled,
  ])

  const terminatingLoansAmount = useMemo(
    () => size(filter(filteredLoansBySelectedCollections, isLoanTerminating)) || null,
    [filteredLoansBySelectedCollections],
  )

  const repaymentCallsAmount = useMemo(
    () => size(filter(filteredLoansBySelectedCollections, isLoanRepaymentCallActive)) || null,
    [filteredLoansBySelectedCollections],
  )

  return {
    filteredLoansBySelectedCollection,
    filteredAllLoans,

    terminatingLoansAmount,
    repaymentCallsAmount,

    isTerminationFilterEnabled,
    toggleTerminationFilter,

    isRepaymentCallFilterEnabled,
    toggleRepaymentCallFilter,

    selectedCollections,
    setSelectedCollections,
  }
}
