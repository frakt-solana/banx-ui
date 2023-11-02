import { useCallback, useEffect, useMemo, useState } from 'react'

import { isInteger } from 'lodash'

import { formatLoansAmount } from '@banx/utils'

export const useOfferFormController = (
  editLoanValue = 0,
  editLoansAmount = 0,
  editDeltaValue = 0,
) => {
  const initialValues = useMemo(() => {
    return {
      loanValue: formatNumber(editLoanValue, '0'),
      loansAmount: formatLoansAmount(editLoansAmount),
      deltaValue: formatNumber(editDeltaValue, '0.1'),
    }
  }, [editLoanValue, editLoansAmount, editDeltaValue])

  const [loanValue, setLoanValue] = useState(initialValues.loanValue)
  const [loansAmount, setLoansAmount] = useState(initialValues.loansAmount)
  const [deltaValue, setDeltaValue] = useState(initialValues.deltaValue)

  useEffect(() => {
    const { loanValue, loansAmount, deltaValue } = initialValues

    setLoanValue(loanValue)
    setLoansAmount(loansAmount)
    setDeltaValue(deltaValue)
  }, [initialValues])

  const onLoanValueChange = useCallback((nextValue: string) => {
    setLoanValue(nextValue)
  }, [])

  const onDeltaValueChange = useCallback((nextValue: string) => {
    setDeltaValue(nextValue)
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
    setLoanValue(initialValues.loanValue)
    setLoansAmount(initialValues.loansAmount)
    setDeltaValue(initialValues.deltaValue)
  }

  const hasFormChanges = useMemo(() => {
    return (
      (editLoansAmount && loansAmount !== initialValues.loansAmount) ||
      (editLoanValue && loanValue !== initialValues.loanValue) ||
      (editLoansAmount && deltaValue !== initialValues.deltaValue)
    )
  }, [initialValues, loansAmount, loanValue, deltaValue, editLoanValue, editLoansAmount])

  return {
    loanValue,
    loansAmount,
    deltaValue,

    onLoanValueChange,
    onLoanAmountChange,
    onDeltaValueChange,

    hasFormChanges: Boolean(hasFormChanges),
    resetFormValues,
  }
}

const formatNumber = (value: number, defaultValue: string) =>
  value ? value.toFixed(2) : defaultValue
