import { useEffect, useMemo } from 'react'

import { BN } from 'fbonds-core'

import { useWalletBalance } from '@banx/hooks'
import { useNftTokenType } from '@banx/store/nft'
import { ZERO_BN, getTokenDecimals, stringToBN } from '@banx/utils'

import { getErrorMessage } from '../helpers'
import { useOfferFormController } from './useOfferFormController'
import { useTokenMarketAndOffer } from './useTokenMarketAndOffer'
import { useTokenOffer } from './useTokenOffer'
import { useTokenOfferTransactions } from './useTokenOfferTransaction'

export const usePlaceTokenOffer = (marketPubkey: string, offerPubkey: string) => {
  const { tokenType } = useNftTokenType()
  const walletBalance = useWalletBalance(tokenType)

  const { offer, market, updateOrAddOffer } = useTokenMarketAndOffer(offerPubkey, marketPubkey)
  const { syntheticOffer, setSyntheticOffer } = useTokenOffer(offerPubkey, marketPubkey)

  const isEditMode = !!offerPubkey

  const {
    collateralsPerToken: collateralsPerTokenString,
    offerSize: offerSizeString,
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
    const newSyntheticOffer = { ...syntheticOffer, offerSize, collateralsPerToken }

    setSyntheticOffer(newSyntheticOffer)
  }, [syntheticOffer, setSyntheticOffer, collateralsPerToken, offerSize])

  const { onCreateTokenOffer, onUpdateTokenOffer, onRemoveTokenOffer } = useTokenOfferTransactions({
    marketPubkey,
    collateralsPerToken,
    loanValue: offerSize,
    updateOrAddOffer,
    resetFormValues,
    optimisticOffer: offer,
    market,
  })

  const offerErrorMessage = getErrorMessage({
    walletBalance,
    syntheticOffer,
    offerSize,
    tokenType,
  })

  const allFieldsAreFilled = !!collateralsPerToken && !!offerSize

  const disablePlaceOffer = !!offerErrorMessage || !allFieldsAreFilled
  const disableUpdateOffer = !hasFormChanges || !!offerErrorMessage || !allFieldsAreFilled

  return {
    isEditMode,

    market,

    collateralsPerTokenString,
    offerSizeString,

    onLoanValueChange,
    onOfferSizeChange,

    offerErrorMessage,

    onCreateTokenOffer,
    onUpdateTokenOffer,
    onRemoveTokenOffer,
    disablePlaceOffer,
    disableUpdateOffer,
  }
}
