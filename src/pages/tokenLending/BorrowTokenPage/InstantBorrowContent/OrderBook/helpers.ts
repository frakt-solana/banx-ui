import { BorrowOffer } from '@banx/api/tokens'

const calculateOfferRatio = (offer: BorrowOffer, maxOffer: BorrowOffer) => {
  const offerFunds = parseFloat(offer.maxTokenToGet)
  const maxOfferFunds = parseFloat(maxOffer.maxTokenToGet)

  if (!maxOfferFunds) return 0

  return (offerFunds / maxOfferFunds) * 100
}

export const createRowStyle = (offer: BorrowOffer, maxOffer: BorrowOffer) => {
  const ratio = calculateOfferRatio(offer, maxOffer)

  const backgroundColorVariable = 'var(--bg-secondary)'

  return {
    background: `linear-gradient(to right, ${backgroundColorVariable} ${ratio}%, transparent ${ratio}%)`,
  }
}
