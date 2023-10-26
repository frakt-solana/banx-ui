import { useCallback, useEffect, useMemo, useState } from 'react'

import { isInteger } from 'lodash'

import { formatLoansAmount } from '@banx/utils'

export const useOfferFormController = (editLoanValue = 0, editLoansAmount = 0) => {
  const initialLoanValue = editLoanValue ? editLoanValue.toFixed(2) : '0'
  const initialLoansAmount = editLoansAmount ? formatLoansAmount(editLoansAmount) : '1'

  const [loanValue, setLoanValue] = useState(initialLoanValue)
  const [loansAmount, setLoansAmount] = useState(initialLoansAmount)

  useEffect(() => {
    if (initialLoanValue || initialLoansAmount) {
      setLoanValue(initialLoanValue)
      setLoansAmount(initialLoansAmount)
    }
  }, [initialLoanValue, initialLoansAmount])

  const onLoanValueChange = useCallback((nextValue: string) => {
    setLoanValue(nextValue)
  }, [])

  const onLoanAmountChange = useCallback((nextValue: string) => {
    const nextValueNumber = parseFloat(nextValue) || 0

    if (!isInteger(nextValueNumber)) {
      setLoansAmount(String(Math.trunc(nextValueNumber)))
    } else {
      setLoansAmount(nextValue)
    }
  }, [])

  const resetFormValues = () => {
    setLoanValue(initialLoanValue)
    setLoansAmount(initialLoansAmount)
  }

  const hasFormChanges = useMemo(() => {
    const isLoansAmountChanged = editLoansAmount && loansAmount !== initialLoansAmount
    const isLoanValueChanged = editLoanValue && loanValue !== initialLoanValue

    return isLoansAmountChanged || isLoanValueChanged
  }, [initialLoansAmount, initialLoanValue, loansAmount, loanValue, editLoanValue, editLoansAmount])

  return {
    loanValue,
    loansAmount,
    onLoanValueChange,
    onLoanAmountChange,
    hasFormChanges: Boolean(hasFormChanges),
    resetFormValues,
  }
}
