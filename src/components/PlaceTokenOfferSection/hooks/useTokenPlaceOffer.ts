import { useNftTokenType } from '@banx/store/nft'
import { getTokenDecimals } from '@banx/utils'

import { useOfferFormController } from './useOfferFormController'

export interface PlaceOfferParams {
  loanValueString: string
  offerSizeString: string

  onLoanValueChange: (nextValue: string) => void
  onOfferSizeChange: (nextValue: string) => void
}

type UsePlaceOffer = (props: {
  offerPubkey: string
  marketPubkey: string
  setOfferPubkey?: (offerPubkey: string) => void
}) => PlaceOfferParams

export const useTokenPlaceOffer: UsePlaceOffer = ({
  marketPubkey,
  offerPubkey,
  setOfferPubkey,
}) => {
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

  return {
    loanValueString,
    offerSizeString,

    onLoanValueChange,
    onOfferSizeChange,
  }
}
