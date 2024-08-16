import { BN } from 'fbonds-core'

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

type CalcTokenToGetParams = {
  collateralToReceive: BN
  tokenDecimals: number
  collateralsPerToken: BN
}

export const calcTokenToGet = ({
  collateralToReceive,
  tokenDecimals,
  collateralsPerToken,
}: CalcTokenToGetParams) => {
  const denominator = new BN(10 ** tokenDecimals)
  return collateralToReceive.mul(denominator).div(collateralsPerToken)
}

export const getUpdatedBorrowOffers = ({
  collateralsAmount,
  offers,
  tokenDecimals,
}: {
  collateralsAmount: number
  offers: BorrowOffer[]
  tokenDecimals: number
}) => {
  let restInputAmount = new BN(collateralsAmount)

  const newOffers: BorrowOffer[] = []

  for (let i = 0; i < offers.length; ++i) {
    const offer = offers[i]

    const maxCollateralToReceiveForOffer = new BN(offer.maxCollateralToReceive)

    if (maxCollateralToReceiveForOffer.gte(restInputAmount)) {
      const denominator = new BN(10 ** tokenDecimals)

      const amountToGet = restInputAmount
        .mul(denominator)
        .divRound(new BN(offer.collateralsPerToken))

      newOffers.push({
        ...offer,
        maxCollateralToReceive: restInputAmount.toString(),
        maxTokenToGet: amountToGet.toString(),
      })
      break
    }

    if (maxCollateralToReceiveForOffer.lt(restInputAmount)) {
      newOffers.push({
        ...offer,
        maxCollateralToReceive: maxCollateralToReceiveForOffer.toString(),
        maxTokenToGet: offer.maxTokenToGet,
      })

      restInputAmount = restInputAmount.sub(maxCollateralToReceiveForOffer)
    }
  }

  return newOffers
}
