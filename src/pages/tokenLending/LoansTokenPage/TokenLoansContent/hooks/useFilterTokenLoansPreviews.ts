import { useCallback, useMemo, useState } from 'react'

import { filter, sumBy } from 'lodash'

import { createGlobalState } from '@banx/store'

import { LoansPreview } from '../types'

const useCollateralTickerStore = createGlobalState<string[]>([])

export const useFilterTokenLoansPreviews = (loansPreviews: LoansPreview[]) => {
  const [isTerminationFilterEnabled, setTerminationFilterState] = useState(false)
  const [isRepaymentCallFilterEnabled, setIsRepaymentCallFilterState] = useState(false)

  const [selectedCollateralTicker, setSelectedCollateralTicker] = useCollateralTickerStore()

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

  const filteredLoansByCollateralTicker = useMemo(() => {
    if (!selectedCollateralTicker.length) return loansPreviews

    return filter(loansPreviews, (preview) =>
      selectedCollateralTicker.includes(preview.collareralTicker),
    )
  }, [loansPreviews, selectedCollateralTicker])

  const filteredLoansBySelectedCollateral = useMemo(
    () => applyActiveFilters(filteredLoansByCollateralTicker),
    [filteredLoansByCollateralTicker, applyActiveFilters],
  )

  const filteredLoansPreviews = useMemo(
    () => applyActiveFilters(loansPreviews),
    [loansPreviews, applyActiveFilters],
  )

  const terminatingLoansAmount = useMemo(
    () => sumBy(filteredLoansByCollateralTicker, (preview) => preview.terminatingLoansAmount || 0),
    [filteredLoansByCollateralTicker],
  )

  const repaymentCallsAmount = useMemo(
    () => sumBy(filteredLoansByCollateralTicker, (preview) => preview.repaymentCallsAmount || 0),
    [filteredLoansByCollateralTicker],
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

    selectedCollateralTicker,
    setSelectedCollateralTicker,
  }
}
