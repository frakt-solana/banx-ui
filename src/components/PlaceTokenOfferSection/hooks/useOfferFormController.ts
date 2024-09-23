import { useCallback, useEffect, useMemo, useState } from 'react'

import { MAX_APR_SPL } from 'fbonds-core/lib/fbond-protocol/constants'
import { clamp } from 'lodash'

import { TokenMarketPreview } from '@banx/api/tokens'
import { useTokenType } from '@banx/store/common'
import { SyntheticTokenOffer } from '@banx/store/token'
import {
  calculateTokensPerCollateral,
  formatTokensPerCollateralToStr,
  getTokenDecimals,
} from '@banx/utils'

const DEFAULT_APR_PERCENT = 30

export const useOfferFormController = (
  syntheticOffer: SyntheticTokenOffer,
  market: TokenMarketPreview | undefined,
) => {
  const {
    collateralsPerToken: syntheticCollateralsPerToken,
    offerSize: syntheticOfferSize,
    apr: syntheticApr,
  } = syntheticOffer

  const { tokenType } = useTokenType()

  const decimals = getTokenDecimals(tokenType)

  const initialValues = useMemo(() => {
    const collateralsDecimals = market?.collateral.decimals || 0

    const collateralsPerToken = calculateTokensPerCollateral(
      syntheticCollateralsPerToken,
      collateralsDecimals,
    )

    const offerSize = calculateOfferSize(syntheticOfferSize, decimals)

    return {
      collateralsPerToken: formatTokensPerCollateralToStr(collateralsPerToken),
      offerSize: offerSize ? String(offerSize) : '0',
      apr: syntheticApr ? String(syntheticApr) : DEFAULT_APR_PERCENT.toString(),
    }
  }, [decimals, market, syntheticApr, syntheticCollateralsPerToken, syntheticOfferSize])

  const [collateralsPerToken, setLoanValue] = useState(initialValues.collateralsPerToken)
  const [offerSize, setOfferSize] = useState(initialValues.offerSize)
  const [apr, setApr] = useState(initialValues.apr)

  useEffect(() => {
    setLoanValue(initialValues.collateralsPerToken)
    setOfferSize(initialValues.offerSize)
    setApr(initialValues.apr)
  }, [initialValues])

  const onLoanValueChange = useCallback((nextValue: string) => {
    setLoanValue(nextValue)
  }, [])

  const onOfferSizeChange = useCallback((nextValue: string) => {
    setOfferSize(nextValue)
  }, [])

  const onAprChange = useCallback((nextValue: string) => {
    const clampedValue = clampInputValue(nextValue, MAX_APR_SPL / 100)
    setApr(clampedValue)
  }, [])

  const resetFormValues = () => {
    setLoanValue(initialValues.collateralsPerToken)
    setOfferSize(initialValues.offerSize)
    setApr(initialValues.apr)
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

const calculateOfferSize = (syntheticOfferSize: number, decimals: number) => {
  const offerSize = syntheticOfferSize / decimals

  //? 1e4 is used for rounding the result to 4 decimal places
  const roundedOfferSize = Math.round(offerSize * 1e4) / 1e4
  return parseFloat(roundedOfferSize.toPrecision(4))
}

const clampInputValue = (value: string, max: number): string => {
  if (!value) return ''

  const valueToNumber = parseFloat(value)
  const clampedValue = clamp(valueToNumber, 0, max)
  return clampedValue.toString()
}
