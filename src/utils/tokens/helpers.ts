import { find } from 'lodash'

import { TokenType } from '@banx/store'

import { formatNumbersWithCommas } from '../common'
import {
  DECIMALS_MAP,
  DECIMAL_PLACES_CONFIG,
  DEFAULT_DECIMAL_PLACES,
  THRESHOLD_MAP,
  TOKEN_UNIT,
} from './constants'

const convertValue = (value: number, tokenType: TokenType) => {
  const decimals = DECIMALS_MAP[tokenType]
  return value / decimals
}

const isValueBelowThreshold = (value: number, threshold: number) => value < threshold

export const formatValueByTokenType = (value: number, tokenType: TokenType) => {
  if (!value) return ''

  const convertedValue = convertValue(value, tokenType)

  if (isValueBelowThreshold(convertedValue, THRESHOLD_MAP[tokenType])) {
    return `<${THRESHOLD_MAP[tokenType]}`
  }

  return formatTokenValue(convertedValue, tokenType)
}

const formatTokenValue = (value: number, tokenType: TokenType) => {
  const decimalPlaces = getDecimalPlaces(value, tokenType)
  const formattedValueWithDecimals = value.toFixed(decimalPlaces)
  return formatNumbersWithCommas(formattedValueWithDecimals)
}

const getDecimalPlaces = (value: number, tokenType: TokenType) => {
  if (!value) return 0

  const config = DECIMAL_PLACES_CONFIG[tokenType]
  return find(config, ({ limit }) => value > limit)?.decimalPlaces ?? DEFAULT_DECIMAL_PLACES
}

export const getDecimals = (tokenType: TokenType) => {
  return DECIMALS_MAP[tokenType]
}

export const getTokenUnit = (tokenType: TokenType) => {
  return TOKEN_UNIT[tokenType]
}
