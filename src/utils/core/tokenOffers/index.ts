import { BN } from 'fbonds-core'
import { BondOfferV3 } from 'fbonds-core/lib/fbond-protocol/types'

import { convertToDecimalString } from '@banx/utils'
import { ZERO_BN } from '@banx/utils/bn'

import { isOfferStateClosed } from '../offers'

export const isBondOfferV3Closed = (offer: BondOfferV3) => {
  const isStateClosed = isOfferStateClosed(offer.pairState)

  return (
    isStateClosed &&
    offer.bidCap.eq(ZERO_BN) &&
    offer.concentrationIndex.eq(ZERO_BN) &&
    offer.bidSettlement.eq(ZERO_BN) &&
    offer.fundsSolOrTokenBalance.eq(ZERO_BN)
  )
}

/**
 * Calculates the number of tokens per collateral unit.
 * @param {BN} collateralsPerToken - The amount of collateral per token.
 * @param {number} collateralDecimals - The number of decimal places used by the collateral token.
 * @returns {BN} -The result is scaled by 1e9 to maintain precision in calculations involving small fractional values
 */

export const calculateTokensPerCollateral = (
  collateralsPerToken: BN,
  collateralDecimals: number,
): BN => {
  const PRECISION_ADJUSTMENT = 9

  if (!collateralsPerToken || collateralsPerToken.eq(ZERO_BN)) {
    return ZERO_BN
  }

  const adjustedScale = collateralDecimals + PRECISION_ADJUSTMENT
  const scaledValue = new BN(10).pow(new BN(adjustedScale))
  const tokensPerCollateral = scaledValue.div(collateralsPerToken)

  return tokensPerCollateral
}

export const formatTokensPerCollateralToStr = (tokensPerCollateral: BN): string => {
  const value = tokensPerCollateral.toNumber() / Math.pow(10, 9)
  const adjustedValue = parseFloat(value.toPrecision(4))

  return convertToDecimalString(adjustedValue)
}
