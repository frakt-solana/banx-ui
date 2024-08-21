import { useCallback, useEffect, useMemo, useState } from 'react'

import { TokenMarketPreview } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'
import { SyntheticTokenOffer } from '@banx/store/token'
import { getTokenDecimals } from '@banx/utils'

export const useOfferFormController = (
  syntheticOffer: SyntheticTokenOffer,
  market: TokenMarketPreview | undefined,
) => {
  const {
    collateralsPerToken: syntheticCollateralsPerToken,
    offerSize: syntheticOfferSize,
    apr: syntheticApr,
  } = syntheticOffer

  const { tokenType } = useNftTokenType()

  const decimals = getTokenDecimals(tokenType)

  const initialValues = useMemo(() => {
    const collateralsDecimals = market?.collateral.decimals || 0

    const collateralsPerToken = calculateTokensPerCollateral(
      syntheticCollateralsPerToken,
      collateralsDecimals,
    )

    const offerSize = calculateOfferSize(syntheticOfferSize, decimals)

    return {
      collateralsPerToken: isFinite(collateralsPerToken) ? String(collateralsPerToken) : '0',
      offerSize: offerSize ? String(offerSize) : '0',
      apr: syntheticApr ? String(syntheticApr) : '0',
    }
  }, [decimals, market, syntheticApr, syntheticCollateralsPerToken, syntheticOfferSize])

  const [collateralsPerToken, setLoanValue] = useState(initialValues.collateralsPerToken)
  const [offerSize, setOfferSize] = useState(initialValues.offerSize)
  const [apr, setApr] = useState(initialValues.apr)

  useEffect(() => {
    setLoanValue(initialValues.collateralsPerToken)
    setOfferSize(initialValues.offerSize)
    setOfferSize(initialValues.apr)
  }, [initialValues])

  const onLoanValueChange = useCallback((nextValue: string) => {
    setLoanValue(nextValue)
  }, [])

  const onOfferSizeChange = useCallback((nextValue: string) => {
    setOfferSize(nextValue)
  }, [])

  const onAprChange = useCallback((nextValue: string) => {
    setApr(nextValue)
  }, [])

  const resetFormValues = () => {
    setLoanValue(initialValues.collateralsPerToken)
    setOfferSize(initialValues.offerSize)
  }

  const hasFormChanges = useMemo(() => {
    return (
      offerSize !== initialValues.offerSize ||
      collateralsPerToken !== initialValues.collateralsPerToken ||
      apr !== initialValues.apr
    )
  }, [offerSize, initialValues, collateralsPerToken, apr])

  return {
    collateralsPerToken,
    offerSize,
    apr,

    onLoanValueChange,
    onOfferSizeChange,
    onAprChange,

    hasFormChanges: Boolean(hasFormChanges),
    resetFormValues,
  }
}

export const calculateTokensPerCollateral = (collateralsPerToken: number, decimals: number) => {
  if (!collateralsPerToken) {
    return 0
  }

  const denominator = Math.pow(10, decimals)
  const tokensPerCollateral = (1 * denominator) / collateralsPerToken

  return parseFloat(tokensPerCollateral.toPrecision(decimals))
}

const calculateOfferSize = (syntheticOfferSize: number, decimals: number) => {
  const offerSize = syntheticOfferSize / decimals

  //? 1e4 is used for rounding the result to 4 decimal places
  const roundedOfferSize = Math.round(offerSize * 1e4) / 1e4
  return roundedOfferSize
}
