import { BN } from 'fbonds-core'
import { MIN_APR_SPL } from 'fbonds-core/lib/fbond-protocol/constants'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { chain } from 'lodash'

import { SyntheticTokenOffer } from '@banx/store/token'
import { getTokenTicker, stringToBN } from '@banx/utils'

type GetErrorMessage = (props: {
  walletBalance: number
  escrowBalance: number
  syntheticOffer: SyntheticTokenOffer
  offerSize: number
  tokenType: LendingTokenType
}) => string

export const getErrorMessage: GetErrorMessage = ({
  walletBalance,
  escrowBalance,
  syntheticOffer,
  offerSize,
  tokenType,
}) => {
  const totalFundsAvailable = syntheticOffer.offerSize + walletBalance + escrowBalance

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

export const getAprErrorMessage = (apr: number) => {
  const aprRate = apr * 100
  const isAprRateTooLow = aprRate < MIN_APR_SPL

  if (!isAprRateTooLow || !apr) return ''

  return createTooLowAprErrorMessage(MIN_APR_SPL)
}

const createInsufficientBalanceErrorMessage = (tokenType: LendingTokenType) => {
  return `Not enough ${getTokenTicker(tokenType)}`
}

const createTooLowAprErrorMessage = (aprRate: number) => {
  return `Min APR is ${aprRate / 100}%`
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

export const calculateLtvPercent = (props: {
  collateralPerToken: string
  collateralPrice: number
  marketTokenDecimals: number
}): number => {
  const { collateralPerToken, collateralPrice, marketTokenDecimals } = props

  const PERCENTAGE_MULTIPLIER = 100
  const BASE_DECIMALS = 12

  if (!collateralPerToken || !collateralPrice) {
    return 0
  }

  const collateralPerTokenBN = stringToBN(collateralPerToken, BASE_DECIMALS)

  const marketTokenScaleFactor = new BN(10).pow(new BN(BASE_DECIMALS - marketTokenDecimals))

  const ltvRatioBN = collateralPerTokenBN
    .mul(new BN(PERCENTAGE_MULTIPLIER))
    .div(new BN(collateralPrice))
    .divRound(marketTokenScaleFactor)

  return parseInt(ltvRatioBN.toString())
}
