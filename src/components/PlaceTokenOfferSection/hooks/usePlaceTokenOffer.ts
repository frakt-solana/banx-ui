import { useEffect, useMemo } from 'react'

import { BN } from 'fbonds-core'

import { useWalletBalance } from '@banx/hooks'
import { useTokenType } from '@banx/store/common'
import { ZERO_BN, getTokenDecimals, stringToBN } from '@banx/utils'

import { getAprErrorMessage, getErrorMessage } from '../helpers'
import { useOfferFormController } from './useOfferFormController'
import { useTokenMarketAndOffer } from './useTokenMarketAndOffer'
import { useTokenOffer } from './useTokenOffer'
import { useTokenOfferTransactions } from './useTokenOfferTransaction'

export const usePlaceTokenOffer = (marketPubkey: string, offerPubkey: string) => {
  const { tokenType } = useTokenType()
  const walletBalance = useWalletBalance(tokenType)

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

  const offerErrorMessage = getErrorMessage({
    walletBalance,
    syntheticOffer,
    offerSize,
    tokenType,
  })

  const aprErrorMessage = getAprErrorMessage(parseFloat(aprString))

  const allFieldsAreFilled = !!collateralsPerToken && !!offerSize && !!parseFloat(aprString)

  const disablePlaceOffer = !!offerErrorMessage || !allFieldsAreFilled || !!aprErrorMessage
  const disableUpdateOffer =
    !hasFormChanges || !!offerErrorMessage || !allFieldsAreFilled || !!aprErrorMessage

  return {
    isEditMode,

    market,

    aprString,
    collateralsPerTokenString,
    offerSizeString,

    onAprChange,
    onLoanValueChange,
    onOfferSizeChange,

    offerErrorMessage,
    aprErrorMessage,

    onCreateTokenOffer,
    onUpdateTokenOffer,
    onRemoveTokenOffer,
    disablePlaceOffer,
    disableUpdateOffer,
  }
}
