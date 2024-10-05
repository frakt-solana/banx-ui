import { useCallback, useMemo, useState } from 'react'

import { filter, sumBy } from 'lodash'

import { createGlobalState } from '@banx/store'

import { LoansPreview } from '../types'

const useCollateralMintsStore = createGlobalState<string[]>([])

export const useFilterTokenLoansPreviews = (loansPreviews: LoansPreview[]) => {
  const [isTerminationFilterEnabled, setTerminationFilterState] = useState(false)
  const [isRepaymentCallFilterEnabled, setIsRepaymentCallFilterState] = useState(false)

  const [selectedCollateralMints, setSelectedCollateralMints] = useCollateralMintsStore()

  const toggleTerminationFilter = () => {
    setIsRepaymentCallFilterState(false)
    setTerminationFilterState(!isTerminationFilterEnabled)
  }

  const toggleRepaymentCallFilter = () => {
    setTerminationFilterState(false)
    setIsRepaymentCallFilterState(!isRepaymentCallFilterEnabled)
  }

  const applyActiveFilters = useCallback(
    (previews: LoansPreview[]) => {
      if (isTerminationFilterEnabled) {
        return previews.filter((preview) => preview.terminatingLoansAmount > 0)
      }

      if (isRepaymentCallFilterEnabled) {
        return previews.filter((preview) => preview.repaymentCallsAmount > 0)
      }

      return previews
    },
    [isTerminationFilterEnabled, isRepaymentCallFilterEnabled],
  )

  const filteredLoansByCollateralMints = useMemo(() => {
    if (!selectedCollateralMints.length) return loansPreviews

    return filter(loansPreviews, (preview) =>
      selectedCollateralMints.includes(preview.collateralMint),
    )
  }, [loansPreviews, selectedCollateralMints])

  const filteredLoansBySelectedCollateral = useMemo(
    () => applyActiveFilters(filteredLoansByCollateralMints),
    [filteredLoansByCollateralMints, applyActiveFilters],
  )

  const filteredLoansPreviews = useMemo(
    () => applyActiveFilters(loansPreviews),
    [loansPreviews, applyActiveFilters],
  )

  const terminatingLoansAmount = useMemo(
    () => sumBy(filteredLoansByCollateralMints, (preview) => preview.terminatingLoansAmount || 0),
    [filteredLoansByCollateralMints],
  )

  const repaymentCallsAmount = useMemo(
    () => sumBy(filteredLoansByCollateralMints, (preview) => preview.repaymentCallsAmount || 0),
    [filteredLoansByCollateralMints],
  )

  return {
    filteredLoansPreviewsBySelectedCollateral: filteredLoansBySelectedCollateral,
    filteredLoansPreviews,

    terminatingLoansAmount,
    repaymentCallsAmount,

    isTerminationFilterEnabled,
    toggleTerminationFilter,

    isRepaymentCallFilterEnabled,
    toggleRepaymentCallFilter,

    selectedCollateralMints,
    setSelectedCollateralMints,
  }
}
