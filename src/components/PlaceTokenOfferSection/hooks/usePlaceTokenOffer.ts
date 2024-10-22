import { useEffect, useMemo } from 'react'

import { BN } from 'fbonds-core'

import { useTokenType } from '@banx/store/common'
import { ZERO_BN, getTokenDecimals, stringToBN } from '@banx/utils'

import { getAprErrorMessage } from '../helpers'
import { useOfferFormController } from './useOfferFormController'
import { useTokenMarketAndOffer } from './useTokenMarketAndOffer'
import { useTokenOffer } from './useTokenOffer'
import { useTokenOfferTransactions } from './useTokenOfferTransaction'

export const usePlaceTokenOffer = (marketPubkey: string, offerPubkey: string) => {
  const { tokenType } = useTokenType()

  const { offer, market, updateOrAddOffer } = useTokenMarketAndOffer(offerPubkey, marketPubkey)
  const { syntheticOffer, setSyntheticOffer } = useTokenOffer(offerPubkey, marketPubkey)

  const isEditMode = !!offerPubkey

  const {
    collateralsPerToken: collateralsPerTokenString,
    offerSize: offerSizeString,
    apr: aprString,

    onAprChange,
    onLoanValueChange,
    onOfferSizeChange,
    hasFormChanges,
    resetFormValues,
  } = useOfferFormController(syntheticOffer, market)

  const decimals = getTokenDecimals(tokenType)

  const collateralsPerToken = useMemo(() => {
    if (!parseFloat(collateralsPerTokenString)) {
      return ZERO_BN
    }

    const collateralDecimals = market?.collateral.decimals || 0
    const adjustedDecimals = Math.max(collateralDecimals, 9)

    const denominator = new BN(10).pow(new BN(collateralDecimals))

    const collateralsPerTokenBN = stringToBN(collateralsPerTokenString, adjustedDecimals)

    if (collateralsPerTokenBN.isZero()) {
      return ZERO_BN
    }

    return denominator.mul(new BN(10).pow(new BN(adjustedDecimals))).div(collateralsPerTokenBN)
  }, [collateralsPerTokenString, market])

  const offerSize = parseFloat(offerSizeString) * decimals

  useEffect(() => {
    if (!syntheticOffer) return
    const newSyntheticOffer = {
      ...syntheticOffer,
      offerSize,
      collateralsPerToken,
      apr: parseFloat(aprString),
    }

    setSyntheticOffer(newSyntheticOffer)
  }, [syntheticOffer, setSyntheticOffer, collateralsPerToken, offerSize, aprString])

  const { onCreateTokenOffer, onUpdateTokenOffer, onRemoveTokenOffer } = useTokenOfferTransactions({
    marketPubkey,
    collateralsPerToken,
    loanValue: offerSize,
    updateOrAddOffer,
    resetFormValues,
    optimisticOffer: offer,
    apr: parseFloat(aprString),
  })

  const aprErrorMessage = getAprErrorMessage(parseFloat(aprString))

  const allFieldsAreFilled = !!collateralsPerToken && !!offerSize && !!parseFloat(aprString)

  const disablePlaceOffer = !allFieldsAreFilled || !!aprErrorMessage
  const disableUpdateOffer = !hasFormChanges || !allFieldsAreFilled || !!aprErrorMessage

  return {
    isEditMode,

    market,

    aprString,
    collateralsPerTokenString,
    offerSizeString,

    onAprChange,
    onLoanValueChange,
    onOfferSizeChange,

    aprErrorMessage,

    onCreateTokenOffer,
    onUpdateTokenOffer,
    onRemoveTokenOffer,
    disablePlaceOffer,
    disableUpdateOffer,
  }
}
