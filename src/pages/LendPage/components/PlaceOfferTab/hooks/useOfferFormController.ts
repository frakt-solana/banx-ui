import { useEffect, useState } from 'react'

import { isEqual, pick } from 'lodash'

export const useOfferFormController = (initialLoanValue = 0, initialLoansAmount = 1) => {
  const [loanValue, setLoanValue] = useState(String(initialLoanValue))
  const [loansAmount, setLoansAmount] = useState(String(initialLoansAmount))

  useEffect(() => {
    if (initialLoanValue || initialLoansAmount) {
      setLoanValue(String(initialLoanValue))
      setLoansAmount(String(initialLoansAmount))
    }
  }, [initialLoanValue, initialLoansAmount])

  const onLoanValueChange = (nextValue: string) => {
    setLoanValue(nextValue)
  }

  const onLoanAmountChange = (nextValue: string) => {
    setLoansAmount(nextValue)
  }

  const resetFormValues = () => {
    setLoanValue(String(initialLoanValue))
    setLoansAmount(String(initialLoansAmount))
  }

  const currentFormValues = { loansAmount, loanValue }
  const initialFormValues = {
    loansAmount: String(initialLoansAmount),
    loanValue: String(initialLoanValue),
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
