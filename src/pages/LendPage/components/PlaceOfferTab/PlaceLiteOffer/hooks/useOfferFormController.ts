import { useCallback, useEffect, useMemo, useState } from 'react'

import { SyntheticOffer } from '@banx/store'

export const useOfferFormController = (syntheticOffer: SyntheticOffer) => {
  const { loanValue: syntheticLoanValue, loansAmount: syntheticLoansAmount } = syntheticOffer

  const initialValues = useMemo(() => {
    return {
      loanValue: syntheticLoanValue ? (syntheticLoanValue / 1e9).toFixed(2) : '0',
      loansAmount: syntheticOffer.isEdit ? String(syntheticLoansAmount) : '1',
    }
  }, [syntheticLoanValue, syntheticLoansAmount, syntheticOffer.isEdit])

  const [loanValue, setLoanValue] = useState(initialValues.loanValue)
  const [loansAmount, setLoansAmount] = useState(initialValues.loansAmount)

  useEffect(() => {
    const { loanValue, loansAmount } = initialValues

    setLoanValue(loanValue)
    setLoansAmount(loansAmount)
  }, [initialValues])

  const onLoanValueChange = useCallback((nextValue: string) => {
    setLoanValue(nextValue)
  }, [])

  const onLoanAmountChange = useCallback((nextValue: string) => {
    setLoansAmount(nextValue)
  }, [])

  const resetFormValues = () => {
    setLoanValue(initialValues.loanValue)
    setLoansAmount(initialValues.loansAmount)
  }

  const hasFormChanges = useMemo(() => {
    return loansAmount !== initialValues.loansAmount || loanValue !== initialValues.loanValue
  }, [loansAmount, initialValues, loanValue])

  return {
    loanValue,
    loansAmount,
    onLoanValueChange,
    onLoanAmountChange,
    hasFormChanges: Boolean(hasFormChanges),
    resetFormValues,
  }
}
