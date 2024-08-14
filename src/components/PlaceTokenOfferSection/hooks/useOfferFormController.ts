import { useCallback, useEffect, useMemo, useState } from 'react'

import { BN } from 'fbonds-core'

import { TokenMarketPreview } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'
import { SyntheticTokenOffer } from '@banx/store/token'
import { ZERO_BN, formatTrailingZeros, getTokenDecimals } from '@banx/utils'

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

    const collateralsPerToken = calculateTokensPerCollateral(
      syntheticCollateralsPerToken,
      collateralsDecimals,
    )

    const offerSize = calculateOfferSize(syntheticOfferSize, decimals)

    return {
      collateralsPerToken: formatTokensPerCollateralToStr(collateralsPerToken),
      offerSize: offerSize ? String(offerSize) : '0',
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

/**
 * Formats the tokens per collateral into a string with fixed decimals
 *
 * @param {BN} tokensPerCollateral - The number of tokens per unit of collateral, scaled by 1e9.
 * @returns {string} - The formatted tokens per collateral string.
 */

export const formatTokensPerCollateralToStr = (tokensPerCollateral: BN): string => {
  const DECIMAL_PRECISION = 9

  const tokensPerCollateralString = tokensPerCollateral.toString().padStart(DECIMAL_PRECISION, '0')
  const integerPart = tokensPerCollateralString.slice(0, -DECIMAL_PRECISION) || '0'
  const fractionalPart = tokensPerCollateralString.slice(-DECIMAL_PRECISION)

  const value = `${integerPart}.${fractionalPart}`

  return formatTrailingZeros(value.replace(/(\.\d*?[1-9]+0{2})\d*$/, '$1')) //? removing trailing zeros after two consecutive zeros.
}

const calculateOfferSize = (syntheticOfferSize: number, decimals: number) => {
  const offerSize = syntheticOfferSize / decimals

  //? 1e4 is used for rounding the result to 4 decimal places
  const roundedOfferSize = Math.round(offerSize * 1e4) / 1e4
  return roundedOfferSize
}
