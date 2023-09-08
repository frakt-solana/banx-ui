import { useEffect, useState } from 'react'

import { isEqual, isInteger, pick } from 'lodash'

const formatInitialLoansAmount = (loansAmount = 0) => {
  return isInteger(loansAmount) ? String(loansAmount) : loansAmount?.toFixed(2)
}

export const useOfferFormController = (editLoanValue = 0, editLoansAmount = 0) => {
  const initialLoanValue = editLoanValue ? editLoanValue.toFixed(2) : '0'
  const initiaLoansAmount = editLoansAmount ? formatInitialLoansAmount(editLoansAmount) : '1'

  const [loanValue, setLoanValue] = useState(initialLoanValue)
  const [loansAmount, setLoansAmount] = useState(initiaLoansAmount)

  useEffect(() => {
    if (initialLoanValue || initiaLoansAmount) {
      setLoanValue(initialLoanValue)
      setLoansAmount(initiaLoansAmount)
    }
  }, [initialLoanValue, initiaLoansAmount])

  const onLoanValueChange = (nextValue: string) => {
    setLoanValue(nextValue)
  }

  const onLoanAmountChange = (nextValue: string) => {
    const nextValueNumber = parseFloat(nextValue) || 0

    if (!isInteger(nextValueNumber)) {
      setLoansAmount(String(Math.trunc(nextValueNumber)))
    } else {
      setLoansAmount(nextValue)
    }
  }

  const resetFormValues = () => {
    setLoanValue(initialLoanValue)
    setLoansAmount(initiaLoansAmount)
  }

  const currentFormValues = { loansAmount, loanValue }
  const initialFormValues = {
    loansAmount: initiaLoansAmount,
    loanValue: initialLoanValue,
  }

  const hasFormChanges =
    (editLoanValue || editLoansAmount) &&
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
