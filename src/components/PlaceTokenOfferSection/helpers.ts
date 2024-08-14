import { BN } from 'fbonds-core'
import { calculateAPRforOffer } from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { chain } from 'lodash'

import { TokenMarketPreview } from '@banx/api/tokens'
import { SyntheticTokenOffer } from '@banx/store/token'
import { ZERO_BN } from '@banx/utils'

import { calculateTokensPerCollateral } from './hooks/useOfferFormController'

type GetErrorMessage = (props: {
  walletBalance: number
  syntheticOffer: SyntheticTokenOffer
  offerSize: number
  tokenType: LendingTokenType
}) => string

export const getErrorMessage: GetErrorMessage = ({
  walletBalance,
  syntheticOffer,
  offerSize,
  tokenType,
}) => {
  const totalFundsAvailable = syntheticOffer.offerSize + walletBalance

  const isBalanceInsufficient = offerSize > totalFundsAvailable

  const errorConditions: Array<[boolean, string]> = [
    [isBalanceInsufficient, createInsufficientBalanceErrorMessage(tokenType)],
  ]

  const errorMessage = chain(errorConditions)
    .find(([condition]) => condition)
    .thru((error) => (error ? error[1] : ''))
    .value() as string

  return errorMessage
}

const createInsufficientBalanceErrorMessage = (tokenType: LendingTokenType) => {
  return `Not enough ${tokenType} in wallet`
}

const DEFAULT_DECIMAL_PLACES = 2
const DECIMAL_PLACES = [
  { limit: 1, decimalPlaces: 2 }, //? Values up to 1 have 0 decimal places
  { limit: 0.001, decimalPlaces: 4 }, //? Values up to 0.001 have 4 decimal places
  { limit: 0, decimalPlaces: 6 }, //? Values greater than 0 but less than 0.001 have 6 decimal places
]

export const getCollateralDecimalPlaces = (value: number) => {
  return DECIMAL_PLACES.find(({ limit }) => value > limit)?.decimalPlaces ?? DEFAULT_DECIMAL_PLACES
}

export const formatLeadingZeros = (value: number, decimals: number) =>
  value
    .toFixed(decimals)
    .replace(/(\.\d*?)0+$/, '$1') //? Remove trailing zeros if they follow a decimal point
    .replace(/\.$/, '') //? Remove the decimal point if it's the last character

export const calculateTokenLendingApr = (
  market: TokenMarketPreview | undefined,
  collateralsPerToken: BN,
) => {
  const { collateralPrice = 0, collateral } = market || {}

  if (!collateralPrice || collateralsPerToken.eq(ZERO_BN)) {
    return 0
  }

  const decimals = collateral?.decimals || 0

  //TODO (TokenLending): Replace collateralPrice to string in BE
  const tokensPerCollateralBN = calculateTokensPerCollateral(collateralsPerToken, decimals)
  const tokensPerCollateralNumber = tokensPerCollateralBN.toNumber() / 1e9

  const ltvPercent = (tokensPerCollateralNumber / collateralPrice) * 100 || 0

  const fullyDilutedValuationNumber = collateral
    ? parseFloat(collateral.fullyDilutedValuationInMillions)
    : 0

  const { factoredApr: aprPercent } = calculateAPRforOffer(ltvPercent, fullyDilutedValuationNumber)

  return aprPercent * 100
}
