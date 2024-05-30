import { useWalletBalance } from '@banx/hooks'
import { useNftTokenType } from '@banx/store/nft'
import { getTokenDecimals } from '@banx/utils'

import { getErrorMessage } from '../helpers'
import { useOfferFormController } from './useOfferFormController'
import { useTokenOfferTransactions } from './useTokenOfferTransaction'

export const useTokenPlaceOffer = (props: { offerPubkey?: string; marketPubkey: string }) => {
  const { marketPubkey, offerPubkey } = props

  const { tokenType } = useNftTokenType()
  const walletBalance = useWalletBalance(tokenType)

  const isEditMode = !!offerPubkey

  const decimals = getTokenDecimals(tokenType)

  const syntheticOffer = { loanValue: 0, offerSize: 0 }

  const {
    loanValue: loanValueString,
    offerSize: offerSizeString,
    onLoanValueChange,
    onOfferSizeChange,
    hasFormChanges,
    resetFormValues,
  } = useOfferFormController(syntheticOffer)

  const loanValue = parseFloat(loanValueString) * decimals
  const offerSize = parseFloat(offerSizeString) * decimals

  const { onCreateTokenOffer, onUpdateTokenOffer, onRemoveTokenOffer } = useTokenOfferTransactions({
    marketPubkey,
    collateralsPerToken: loanValue,
    loanValue: offerSize,
    updateOrAddOffer: () => null,
    resetFormValues,
  })

  const offerErrorMessage = getErrorMessage({
    walletBalance,
    syntheticOffer,
    offerSize,
    collateralsPerToken: loanValue,
    tokenType,
  })

  const allFieldsAreFilled = !!loanValue && !!offerSize

  const disablePlaceOffer = !!offerErrorMessage || !allFieldsAreFilled
  const disableUpdateOffer = !hasFormChanges || !!offerErrorMessage || !allFieldsAreFilled

  const showBorrowerMessage = !offerErrorMessage && allFieldsAreFilled

  return {
    isEditMode,

    loanValueString,
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
