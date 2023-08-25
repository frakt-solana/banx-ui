import { useEffect, useState } from 'react'

import { isEqual, isInteger, pick } from 'lodash'

export const useOfferFormController = (initialLoanValue = 0, initialLoansAmount = 1) => {
  const initialFixedLoanValue = initialLoanValue?.toFixed(2)
  const initialFixedLoansAmount = isInteger(initialLoansAmount)
    ? String(initialLoansAmount)
    : initialLoansAmount?.toFixed(2)

  const [loanValue, setLoanValue] = useState(initialFixedLoanValue)
  const [loansAmount, setLoansAmount] = useState(initialFixedLoansAmount)

  useEffect(() => {
    if (initialFixedLoanValue || initialFixedLoansAmount) {
      setLoanValue(initialFixedLoanValue)
      setLoansAmount(initialFixedLoansAmount)
    }
  }, [initialFixedLoanValue, initialFixedLoansAmount])

  const onLoanValueChange = (nextValue: string) => {
    setLoanValue(nextValue)
  }

  const onLoanAmountChange = (nextValue: string) => {
    setLoansAmount(nextValue)
  }

  const resetFormValues = () => {
    setLoanValue(initialFixedLoanValue)
    setLoansAmount(initialFixedLoansAmount)
  }

  const currentFormValues = { loansAmount, loanValue }
  const initialFormValues = {
    loansAmount: initialFixedLoansAmount,
    loanValue: initialFixedLoanValue,
  }

  const hasFormChanges =
    (initialLoanValue || initialLoansAmount) &&
    !isEqual(pick(currentFormValues, Object.keys(initialFormValues)), initialFormValues)

  return {
    loanValue,
    loansAmount,
    onLoanValueChange,
    onLoanAmountChange,
    hasFormChanges: Boolean(hasFormChanges),
    resetFormValues,
  }
}
