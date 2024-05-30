import { useEffect } from 'react'

import { useWalletBalance } from '@banx/hooks'
import { useNftTokenType } from '@banx/store/nft'
import { getTokenDecimals } from '@banx/utils'

import { getErrorMessage } from '../helpers'
import { useOfferFormController } from './useOfferFormController'
import { useSyntheticTokenOffer } from './useSyntheticTokenOffer'
import { useTokenOfferTransactions } from './useTokenOfferTransaction'

export const useTokenPlaceOffer = (marketPubkey: string, offerPubkey: string) => {
  const { tokenType } = useNftTokenType()
  const walletBalance = useWalletBalance(tokenType)

  const { syntheticOffer, setSyntheticOffer } = useSyntheticTokenOffer(offerPubkey, marketPubkey)

  const isEditMode = !!offerPubkey

  const {
    collateralsPerToken: collateralsPerTokenString,
    offerSize: offerSizeString,
    onLoanValueChange,
    onOfferSizeChange,
    hasFormChanges,
    resetFormValues,
  } = useOfferFormController(syntheticOffer)

  const decimals = getTokenDecimals(tokenType)

  const collateralsPerToken = parseFloat(collateralsPerTokenString) * decimals
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
    updateOrAddOffer: () => null,
    resetFormValues,
  })

  const offerErrorMessage = getErrorMessage({
    walletBalance,
    syntheticOffer,
    offerSize,
    collateralsPerToken,
    tokenType,
  })

  const allFieldsAreFilled = !!collateralsPerToken && !!offerSize

  const disablePlaceOffer = !!offerErrorMessage || !allFieldsAreFilled
  const disableUpdateOffer = !hasFormChanges || !!offerErrorMessage || !allFieldsAreFilled

  const showBorrowerMessage = !offerErrorMessage && allFieldsAreFilled

  return {
    isEditMode,

    collateralsPerTokenString,
    offerSizeString,

    onLoanValueChange,
    onOfferSizeChange,

    offerErrorMessage,
    showBorrowerMessage,

    onCreateTokenOffer,
    onUpdateTokenOffer,
    onRemoveTokenOffer,
    disablePlaceOffer,
    disableUpdateOffer,
  }
}
