import { UserOffer } from '@banx/api/core'

export interface TableUserOfferData {
  loanValue: number
  loansAmount: number
  size: number
  collectionImage: string
  collectionName: string
  publicKey: string
}

export const parseUserOffers = (offers: UserOffer[]): TableUserOfferData[] => {
  return offers.map((offer) => {
    const { publicKey, fundsSolOrTokenBalance, currentSpotPrice, collectionImage, collectionName } =
      offer

    const loansAmount = fundsSolOrTokenBalance / currentSpotPrice
    const loanValue = currentSpotPrice * Math.min(loansAmount, 1)
    const size = loansAmount * loanValue

    return {
      publicKey,
      loanValue,
      loansAmount,
      size,
      collectionImage,
      collectionName,
    }
  })
}
