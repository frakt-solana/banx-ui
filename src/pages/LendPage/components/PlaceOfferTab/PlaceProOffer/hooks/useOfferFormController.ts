import { useCallback, useEffect, useMemo, useState } from 'react'

import { SyntheticOffer } from '@banx/store'

export const useOfferFormController = (syntheticOffer: SyntheticOffer) => {
  const {
    deltaValue: syntheticDeltaValue,
    loanValue: syntheticLoanValue,
    loansAmount: syntheticLoansAmount,
  } = syntheticOffer

  const initialValues = useMemo(() => {
    return {
      deltaValue: formatNumber(syntheticDeltaValue / 1e9, '0.1'),
      loanValue: formatNumber(syntheticLoanValue / 1e9),
      loansAmount: String(syntheticLoansAmount),
    }
  }, [syntheticLoanValue, syntheticLoansAmount, syntheticDeltaValue])

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
    setLoansAmount(nextValue)
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

const formatNumber = (value: number, defaultValue = '0') =>
  value ? value.toFixed(2) : defaultValue
