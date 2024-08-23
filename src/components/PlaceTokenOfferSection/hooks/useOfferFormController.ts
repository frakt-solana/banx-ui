import { useCallback, useEffect, useMemo, useState } from 'react'

import { BN } from 'fbonds-core'
import { MAX_APR_SPL } from 'fbonds-core/lib/fbond-protocol/constants'
import { clamp } from 'lodash'

import { TokenMarketPreview } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'
import { SyntheticTokenOffer } from '@banx/store/token'
import { ZERO_BN, convertToDecimalString, getTokenDecimals } from '@banx/utils'

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
      collateralsPerToken: formatTokensPerCollateralToStr(collateralsPerToken),
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

/**
 * Calculates the number of tokens per collateral unit.
 * @param {BN} collateralsPerToken - The amount of collateral per token.
 * @param {number} collateralDecimals - The number of decimal places used by the collateral token.
 * @returns {BN} -The result is scaled by 1e9 to maintain precision in calculations involving small fractional values
 */

export const calculateTokensPerCollateral = (
  collateralsPerToken: BN,
  collateralDecimals: number,
): BN => {
  const PRECISION_ADJUSTMENT = 9

  if (!collateralsPerToken || collateralsPerToken.eq(ZERO_BN)) {
    return ZERO_BN
  }

  const adjustedScale = collateralDecimals + PRECISION_ADJUSTMENT
  const scaledValue = new BN(10).pow(new BN(adjustedScale))
  const tokensPerCollateral = scaledValue.div(collateralsPerToken)

  return tokensPerCollateral
}

export const formatTokensPerCollateralToStr = (tokensPerCollateral: BN): string => {
  const value = tokensPerCollateral.toNumber() / Math.pow(10, 9)
  const adjustedValue = parseFloat(value.toPrecision(4))

  return convertToDecimalString(adjustedValue)
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
