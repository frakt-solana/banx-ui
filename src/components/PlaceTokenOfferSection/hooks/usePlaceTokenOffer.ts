import { useEffect, useMemo } from 'react'

import { useWalletBalance } from '@banx/hooks'
import { useTokenMarketsPreview } from '@banx/pages/tokenLending/LendTokenPage'
import { useNftTokenType } from '@banx/store/nft'
import { getTokenDecimals } from '@banx/utils'

import { getErrorMessage } from '../helpers'
import { useOfferFormController } from './useOfferFormController'
import { useTokenOffer } from './useTokenOffer'
import { useTokenOfferTransactions } from './useTokenOfferTransaction'

export const usePlaceTokenOffer = (marketPubkey: string, offerPubkey: string) => {
  const { tokenType } = useNftTokenType()
  const walletBalance = useWalletBalance(tokenType)

  const { syntheticOffer, setSyntheticOffer, offer, updateOrAddOffer } = useTokenOffer(
    offerPubkey,
    marketPubkey,
  )

  const { marketsPreview } = useTokenMarketsPreview()
  const market = useMemo(() => {
    return marketsPreview.find((market) => market.marketPubkey === marketPubkey)
  }, [marketPubkey, marketsPreview])

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
    updateOrAddOffer,
    resetFormValues,
    optimisticOffer: offer,
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

  const showBorrowerMessage = !offerErrorMessage && allFieldsAreFilled

  return {
    isEditMode,

    market,

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
