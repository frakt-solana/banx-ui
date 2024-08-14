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

export const calculateTokensPerCollateral = (collateralsPerToken: BN, decimals: number): BN => {
  if (!collateralsPerToken || collateralsPerToken.eq(ZERO_BN)) {
    return ZERO_BN
  }

  const denominator = new BN(10).pow(new BN(decimals + 9))
  const tokensPerCollateral = denominator.div(collateralsPerToken)

  return tokensPerCollateral
}

export const formatTokensPerCollateralToStr = (tokensPerCollateral: BN) => {
  const DECIMALS = 9

  const tokensPerCollateralString = tokensPerCollateral.toString().padStart(DECIMALS, '0')
  const integerPart = tokensPerCollateralString.slice(0, -DECIMALS) || '0'
  const fractionalPart = tokensPerCollateralString.slice(-DECIMALS)

  return formatTrailingZeros(`${integerPart}.${fractionalPart}`)
}

const calculateOfferSize = (syntheticOfferSize: number, decimals: number) => {
  const offerSize = syntheticOfferSize / decimals

  //? 1e4 is used for rounding the result to 4 decimal places
  const roundedOfferSize = Math.round(offerSize * 1e4) / 1e4
  return roundedOfferSize
}
