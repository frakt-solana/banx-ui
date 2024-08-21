import { useEffect } from 'react'

import { useWalletBalance } from '@banx/hooks'
import { useNftTokenType } from '@banx/store/nft'
import { getTokenDecimals } from '@banx/utils'

import { getAprErrorMessage, getErrorMessage } from '../helpers'
import { useOfferFormController } from './useOfferFormController'
import { useTokenMarketAndOffer } from './useTokenMarketAndOffer'
import { useTokenOffer } from './useTokenOffer'
import { useTokenOfferTransactions } from './useTokenOfferTransaction'

// TODO (TokenLending): Get constants from SDK
export const MAX_LENDING_APR_RATE = 50_000
export const MIN_LENDING_APR_RATE = 500

export const usePlaceTokenOffer = (marketPubkey: string, offerPubkey: string) => {
  const { tokenType } = useNftTokenType()
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

  const collateralsPerToken =
    (1 / parseFloat(collateralsPerTokenString)) * Math.pow(10, market?.collateral.decimals || 0)

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

  const disablePlaceOffer = !!offerErrorMessage || !allFieldsAreFilled
  const disableUpdateOffer = !hasFormChanges || !!offerErrorMessage || !allFieldsAreFilled

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
