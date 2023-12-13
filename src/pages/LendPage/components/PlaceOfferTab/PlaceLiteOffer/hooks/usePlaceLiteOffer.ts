import { OfferParams } from '../../hooks'
import { calcLoanToValuePercentage } from '../helpers'

export const usePlaceLiteOffer = ({
  marketPreview,
  loanValue,

  hasFormChanges,
  offerSize,
  offerErrorMessage,
}: OfferParams) => {
  const showBorrowerMessage = !offerErrorMessage && !!offerSize
  const disablePlaceOffer = !!offerErrorMessage || !offerSize
  const disableUpdateOffer = !hasFormChanges || !!offerErrorMessage || !offerSize

  const loanToValuePercent = calcLoanToValuePercentage(loanValue, marketPreview)

  return {
    loanToValuePercent,
    marketApr: marketPreview?.marketApr || 0,
    loanValue,

    showBorrowerMessage,
    offerErrorMessage,

    disableUpdateOffer,
    disablePlaceOffer,
  }
}
