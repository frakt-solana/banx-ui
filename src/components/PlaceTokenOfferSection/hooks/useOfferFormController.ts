import { useCallback, useEffect, useMemo, useState } from 'react'

import BN from 'bn.js'

import { TokenMarketPreview } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'
import { SyntheticTokenOffer } from '@banx/store/token'
import { ZERO_BN, getTokenDecimals } from '@banx/utils'

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
      collateralsPerToken: isFinite(collateralsPerToken) ? String(collateralsPerToken) : '0',
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

export const calculateTokensPerCollateral = (collateralsPerToken: BN, decimals: number) => {
  if (!collateralsPerToken || collateralsPerToken.eq(ZERO_BN)) {
    return 0
  }

  const denominator = Math.pow(10, decimals)
  const tokensPerCollateral = (1 * denominator) / collateralsPerToken.toNumber()

  return parseFloat(tokensPerCollateral.toPrecision(decimals))
}

const calculateOfferSize = (syntheticOfferSize: BN, decimals: number) => {
  const offerSize = syntheticOfferSize.div(new BN(decimals))

  //? 1e4 is used for rounding the result to 4 decimal places
  const roundedOfferSize = Math.round(offerSize.mul(new BN(1e4)).div(new BN(1e4)).toNumber())
  return roundedOfferSize
}
