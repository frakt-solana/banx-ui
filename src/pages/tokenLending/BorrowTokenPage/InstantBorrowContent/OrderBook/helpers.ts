import { Offer } from '@banx/api/nft'
import { CollateralToken } from '@banx/api/tokens'

export const calcOfferLtv = (offer: Offer, collateral: CollateralToken | undefined) => {
  if (!collateral) return 0

  const tokensPerCollateral =
    (1 / offer.validation.collateralsPerToken) * Math.pow(10, collateral.collateral.decimals)

  const ltvPercent = (tokensPerCollateral / collateral.collateralPrice) * 100

  return ltvPercent
}
