import { useCallback, useEffect, useMemo, useState } from 'react'

import { clamp, trimStart } from 'lodash'

import { SyntheticOffer } from '@banx/store/common'
import { useTokenType } from '@banx/store/nft'
import { getTokenDecimals } from '@banx/utils'

export const useOfferFormController = (syntheticOffer: SyntheticOffer) => {
  const { tokenType } = useTokenType()

  const {
    deltaValue: syntheticDeltaValue,
    loanValue: syntheticLoanValue,
    loansAmount: syntheticLoansAmount,
  } = syntheticOffer

  const decimals = getTokenDecimals(tokenType)

  const initialValues = useMemo(() => {
    return {
      deltaValue: formatNumber(syntheticDeltaValue / decimals),
      loanValue: formatNumber(syntheticLoanValue / decimals),
      loansAmount: syntheticOffer.isEdit ? String(syntheticLoansAmount) : '1',
    }
  }, [
    decimals,
    syntheticDeltaValue,
    syntheticLoanValue,
    syntheticLoansAmount,
    syntheticOffer.isEdit,
  ])

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
  //? Remove trailing zeros
  return formattedValue.replace(/\.?0+$/, '')
}
