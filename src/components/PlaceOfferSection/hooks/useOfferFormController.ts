import { useCallback, useEffect, useMemo, useState } from 'react'

import { clamp, trimStart } from 'lodash'

import { SyntheticOffer } from '@banx/store'

export const useOfferFormController = (syntheticOffer: SyntheticOffer) => {
  const {
    deltaValue: syntheticDeltaValue,
    loanValue: syntheticLoanValue,
    loansAmount: syntheticLoansAmount,
  } = syntheticOffer

  const initialValues = useMemo(() => {
    return {
      deltaValue: formatNumber(syntheticDeltaValue / 1e9),
      loanValue: formatNumber(syntheticLoanValue / 1e9),
      loansAmount: syntheticOffer.isEdit ? String(syntheticLoansAmount) : '1',
    }
  }, [syntheticDeltaValue, syntheticLoanValue, syntheticLoansAmount, syntheticOffer])

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
    const sanitizedValue = trimStart(nextValue, '0')
    const numericValue = parseFloat(sanitizedValue) || 0
    const clampedValue = clamp(numericValue, 0, 10000)

    setLoansAmount(clampedValue.toString())
  }, [])

  const resetFormValues = () => {
    setLoanValue(initialValues.loanValue)
    setLoansAmount(initialValues.loansAmount)
    setDeltaValue(initialValues.deltaValue)
  }

  const hasFormChanges = useMemo(() => {
    return (
      loansAmount !== initialValues.loansAmount ||
      loanValue !== initialValues.loanValue ||
      deltaValue !== initialValues.deltaValue
    )
  }, [initialValues, loansAmount, loanValue, deltaValue])

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

const formatNumber = (value: number, defaultValue = '0') => {
  if (!value) return defaultValue

  const formattedValue = value.toFixed(2)
  return formattedValue.replace(/\.?0+$/, '')
}
