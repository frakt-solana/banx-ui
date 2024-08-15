import { Offer } from '@banx/api/nft'
import { CollateralToken } from '@banx/api/tokens'
import { calculateIdleFundsInOffer } from '@banx/utils'

export const calcOfferLtv = (offer: Offer, collateral: CollateralToken | undefined) => {
  if (!collateral) return 0

  const tokensPerCollateral =
    (1 / offer.validation.collateralsPerToken) * Math.pow(10, collateral.collateral.decimals)

  const ltvPercent = (tokensPerCollateral / collateral.collateralPrice) * 100

  return ltvPercent
}

const calculateOfferRatio = (offer: Offer, maxOffer: Offer) => {
  const offerFunds = calculateIdleFundsInOffer(offer).toNumber()
  const maxOfferFunds = calculateIdleFundsInOffer(maxOffer).toNumber()

  if (!maxOfferFunds) return 0

  return (offerFunds / maxOfferFunds) * 100
}

export const createRowStyle = (offer: Offer, maxOffer: Offer) => {
  const ratio = calculateOfferRatio(offer, maxOffer)

  const backgroundColorVariable = 'var(--bg-secondary)'

  return {
    background: `linear-gradient(to right, ${backgroundColorVariable} ${ratio}%, transparent ${ratio}%)`,
  }
}
