import { useCallback, useEffect, useMemo, useState } from 'react'

import { TokenMarketPreview } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'
import { SyntheticTokenOffer } from '@banx/store/token'
import { getTokenDecimals } from '@banx/utils'

export const useOfferFormController = (
  syntheticOffer: SyntheticTokenOffer,
  market: TokenMarketPreview | undefined,
) => {
  const { collateralsPerToken: syntheticCollateralsPerToken, offerSize: syntheticOfferSize } =
    syntheticOffer

  const { tokenType } = useNftTokenType()

  const decimals = getTokenDecimals(tokenType)

  const initialValues = useMemo(() => {
    const collateralsDecimals = market?.collateral.decimals || 0

    const collateralsPerToken =
      (1 / syntheticCollateralsPerToken) * Math.pow(10, collateralsDecimals)

    return {
      collateralsPerToken: isFinite(collateralsPerToken) ? formatNumber(collateralsPerToken) : '0',
      offerSize: formatNumber(syntheticOfferSize / decimals),
    }
  }, [decimals, market, syntheticCollateralsPerToken, syntheticOfferSize])

  const [collateralsPerToken, setLoanValue] = useState(initialValues.collateralsPerToken)
  const [offerSize, setOfferSize] = useState(initialValues.offerSize)

  useEffect(() => {
    setLoanValue(initialValues.collateralsPerToken)
    setOfferSize(initialValues.offerSize)
  }, [initialValues])

  const onLoanValueChange = useCallback((nextValue: string) => {
    setLoanValue(nextValue)
  }, [])

  const onOfferSizeChange = useCallback((nextValue: string) => {
    setOfferSize(nextValue)
  }, [])

  const resetFormValues = () => {
    setLoanValue(initialValues.collateralsPerToken)
    setOfferSize(initialValues.offerSize)
  }

  const hasFormChanges = useMemo(() => {
    return (
      offerSize !== initialValues.offerSize ||
      collateralsPerToken !== initialValues.collateralsPerToken
    )
  }, [initialValues, offerSize, collateralsPerToken])

  return {
    collateralsPerToken,
    offerSize,

    onLoanValueChange,
    onOfferSizeChange,

    hasFormChanges: Boolean(hasFormChanges),
    resetFormValues,
  }
}

const formatNumber = (value: number, defaultValue = '0') => {
  if (!value) return defaultValue

  //? Remove trailing zeros
  return value.toString().replace(/\.?0+$/, '')
}
