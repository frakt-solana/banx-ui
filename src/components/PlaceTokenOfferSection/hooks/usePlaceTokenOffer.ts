import { useEffect } from 'react'

import { useWalletBalance } from '@banx/hooks'
import { useNftTokenType } from '@banx/store/nft'
import { getTokenDecimals } from '@banx/utils'

import { getErrorMessage } from '../helpers'
import { convertBondOfferV3ToCore } from './../../../api/nft/core/converters'
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

  const collateralsPerToken =
    (1 / parseFloat(collateralsPerTokenString)) * Math.pow(10, market?.collateral.decimals || 0)

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
    optimisticOffer: offer ? convertBondOfferV3ToCore(offer) : undefined,
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
