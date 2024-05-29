import { useCallback, useEffect, useMemo, useState } from 'react'

import { useNftTokenType } from '@banx/store/nft'
import { getTokenDecimals } from '@banx/utils'

export const useOfferFormController = (syntheticOffer: any) => {
  const { loanValue: syntheticLoanValue, offerSize: syntheticOfferSize } = syntheticOffer

  const { tokenType } = useNftTokenType()

  const decimals = getTokenDecimals(tokenType)

  const initialValues = useMemo(() => {
    return {
      loanValue: formatNumber(syntheticLoanValue / decimals),
      offerSize: formatNumber(syntheticOfferSize),
    }
  }, [decimals, syntheticLoanValue, syntheticOfferSize])

  const [loanValue, setLoanValue] = useState(initialValues.loanValue)
  const [offerSize, setOfferSize] = useState(initialValues.offerSize)

  useEffect(() => {
    setLoanValue(initialValues.loanValue)
    setOfferSize(initialValues.offerSize)
  }, [initialValues])

  const onLoanValueChange = useCallback((nextValue: string) => {
    setLoanValue(nextValue)
  }, [])

  const onOfferSizeChange = useCallback((nextValue: string) => {
    setOfferSize(nextValue)
  }, [])

  const resetFormValues = () => {
    setLoanValue(initialValues.loanValue)
    setOfferSize(initialValues.offerSize)
  }

  const hasFormChanges = useMemo(() => {
    return offerSize !== initialValues.offerSize || loanValue !== initialValues.loanValue
  }, [initialValues, offerSize, loanValue])

  return {
    loanValue,
    offerSize,

    onLoanValueChange,
    onOfferSizeChange,

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
