import { UserOffer } from '@banx/api/core'

export interface TableUserOfferData {
  publicKey: string
  hadoMarket: string
  assetReceiver: string

  collectionImage: string
  collectionName: string

  loansAmount: number
  loanValue: number
  size: number
  apr: number
}

export const parseUserOffers = (offers: UserOffer[]): TableUserOfferData[] => {
  return offers.map((offer) => {
    const {
      publicKey,
      marketApr,
      fundsSolOrTokenBalance,
      currentSpotPrice,
      collectionImage,
      collectionName,
      hadoMarket,
      assetReceiver,
    } = offer

    const loansAmount = fundsSolOrTokenBalance / currentSpotPrice
    const loanValue = currentSpotPrice * Math.min(loansAmount, 1)
    const size = loansAmount * loanValue
    const apr = marketApr / 1e2

    return {
      publicKey,
      hadoMarket,
      assetReceiver,
      collectionImage,
      collectionName,
      loansAmount,
      loanValue,
      size,
      apr,
    }
  })
}
