import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { find } from 'lodash'

import { formatNumbersWithCommas } from '../common'
import {
  DECIMAL_PLACES_LIMITS,
  DEFAULT_DECIMAL_PLACES,
  MarketType,
  TOKEN_DECIMALS,
  TOKEN_THRESHOLD,
  TOKEN_UNIT,
} from './constants'

const isValueBelowThreshold = (value: number, threshold: number) => value < threshold

export const convertTokenValue = (value: number, tokenType: LendingTokenType) => {
  const decimals = TOKEN_DECIMALS[tokenType]
  return value / decimals
}

export const formatValueByLendingTokenType = (value: number, tokenType: LendingTokenType) => {
  if (!value) return ''

  const convertedValue = convertTokenValue(value, tokenType)

  if (isValueBelowThreshold(convertedValue, TOKEN_THRESHOLD[tokenType])) {
    return `<${TOKEN_THRESHOLD[tokenType]}`
  }

  return formatTokenValue(convertedValue, tokenType)
}

const formatTokenValue = (value: number, tokenType: LendingTokenType) => {
  const decimalPlaces = getDecimalPlaces(value, tokenType)
  const formattedValueWithDecimals = value.toFixed(decimalPlaces)
  return formatNumbersWithCommas(formattedValueWithDecimals)
}

export const getDecimalPlaces = (value: number, tokenType: LendingTokenType) => {
  if (!value) return 0

  const limits = DECIMAL_PLACES_LIMITS[tokenType]
  return find(limits, ({ limit }) => value > limit)?.decimalPlaces ?? DEFAULT_DECIMAL_PLACES
}

export const getTokenDecimals = (tokenType: LendingTokenType) => {
  return TOKEN_DECIMALS[tokenType]
}

export const getTokenUnit = (tokenType: LendingTokenType) => {
  return TOKEN_UNIT[tokenType]
}

export const isSolLendingTokenType = (tokenType: LendingTokenType) =>
  tokenType === LendingTokenType.NativeSol
export const isUsdcLendingTokenType = (tokenType: LendingTokenType) =>
  tokenType === LendingTokenType.Usdc

const LENDING_TOKEN_TO_MARKET_MAP: Record<LendingTokenType, MarketType> = {
  [LendingTokenType.NativeSol]: MarketType.SOL,
  [LendingTokenType.Usdc]: MarketType.USDC,
}

export const convertToMarketType = (tokenType: LendingTokenType): MarketType => {
  return LENDING_TOKEN_TO_MARKET_MAP[tokenType]
}
