import { find } from 'lodash'

import { TokenType } from '@banx/store'

import { formatNumbersWithCommas } from '../common'
import {
  DECIMAL_PLACES_LIMITS,
  DEFAULT_DECIMAL_PLACES,
  TOKEN_DECIMALS,
  TOKEN_THRESHOLD,
  TOKEN_UNIT,
} from './constants'

const isValueBelowThreshold = (value: number, threshold: number) => value < threshold

export const convertTokenValue = (value: number, tokenType: TokenType) => {
  const decimals = TOKEN_DECIMALS[tokenType]
  return value / decimals
}

export const formatValueByTokenType = (value: number, tokenType: TokenType) => {
  if (!value) return ''

  const convertedValue = convertTokenValue(value, tokenType)

  if (isValueBelowThreshold(convertedValue, TOKEN_THRESHOLD[tokenType])) {
    return `<${TOKEN_THRESHOLD[tokenType]}`
  }

  return formatTokenValue(convertedValue, tokenType)
}

const formatTokenValue = (value: number, tokenType: TokenType) => {
  const decimalPlaces = getDecimalPlaces(value, tokenType)
  const formattedValueWithDecimals = value.toFixed(decimalPlaces)
  return formatNumbersWithCommas(formattedValueWithDecimals)
}

export const getDecimalPlaces = (value: number, tokenType: TokenType) => {
  if (!value) return 0

  const limits = DECIMAL_PLACES_LIMITS[tokenType]
  return find(limits, ({ limit }) => value > limit)?.decimalPlaces ?? DEFAULT_DECIMAL_PLACES
}

export const getTokenDecimals = (tokenType: TokenType) => {
  return TOKEN_DECIMALS[tokenType]
}

export const getTokenUnit = (tokenType: TokenType) => {
  return TOKEN_UNIT[tokenType]
}
