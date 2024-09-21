import { useMemo, useState } from 'react'

import { filter, size } from 'lodash'

import { core } from '@banx/api/tokens'
import { createGlobalState } from '@banx/store'
import { isTokenLoanRepaymentCallActive, isTokenLoanTerminating } from '@banx/utils'

const useCollectionsStore = createGlobalState<string[]>([])

export const useFilterLoans = (loans: core.TokenLoan[]) => {
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

    return filter(loans, ({ collateral }) => selectedCollections.includes(collateral.ticker))
  }, [loans, selectedCollections])

  const { filteredLoansBySelectedCollection, filteredAllLoans } = useMemo(() => {
    const applyFilter = (loans: core.TokenLoan[]) => {
      if (isTerminationFilterEnabled) return filter(loans, isTokenLoanTerminating)
      if (isRepaymentCallFilterEnabled) return filter(loans, isTokenLoanRepaymentCallActive)
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
    () => size(filter(filteredLoansBySelectedCollections, isTokenLoanTerminating)) || null,
    [filteredLoansBySelectedCollections],
  )

  const repaymentCallsAmount = useMemo(
    () => size(filter(filteredLoansBySelectedCollections, isTokenLoanRepaymentCallActive)) || null,
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
