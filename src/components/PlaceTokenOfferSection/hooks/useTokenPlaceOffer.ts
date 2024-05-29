import { useNftTokenType } from '@banx/store/nft'
import { getTokenDecimals } from '@banx/utils'

import { useOfferFormController } from './useOfferFormController'

export const useTokenPlaceOffer = (props: { offerPubkey?: string; marketPubkey: string }) => {
  const { marketPubkey, offerPubkey } = props

  const isEditMode = !!offerPubkey

  const { tokenType } = useNftTokenType()

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
  const offerSize = parseFloat(offerSizeString)

  const offerErrorMessage = null

  const disablePlaceOffer = !!offerErrorMessage || !offerSize
  const disableUpdateOffer = !hasFormChanges || !!offerErrorMessage || !offerSize

  const showBorrowerMessage = !offerErrorMessage && !!offerSize

  return {
    isEditMode,

    loanValueString,
    offerSizeString,

    onLoanValueChange,
    onOfferSizeChange,

    offerErrorMessage,
    showBorrowerMessage,

    disablePlaceOffer,
    disableUpdateOffer,
  }
}
