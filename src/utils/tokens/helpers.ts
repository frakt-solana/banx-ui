import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { find } from 'lodash'

import { formatNumbersWithCommas } from '../common'
import {
  DECIMAL_PLACES_LIMITS,
  DEFAULT_DECIMAL_PLACES,
  MINIMUM_DISPLAYABLE_TOKEN_VALUE,
  TOKEN_DECIMALS,
  TOKEN_UNIT,
} from './constants'

const isValueBelowThreshold = (value: number, threshold: number) => value < threshold

export const convertToHumanNumber = (value: number, tokenType: LendingTokenType): number => {
  const decimals = TOKEN_DECIMALS[tokenType]
  return value / decimals
}

export const formatValueByTokenType = (value: number, tokenType: LendingTokenType): string => {
  if (!value) return ''

  const convertedValue = convertToHumanNumber(value, tokenType)

  if (isValueBelowThreshold(convertedValue, MINIMUM_DISPLAYABLE_TOKEN_VALUE[tokenType])) {
    return `<${MINIMUM_DISPLAYABLE_TOKEN_VALUE[tokenType]}`
  }

  return formatTokenValue(convertedValue, tokenType)
}

const formatTokenValue = (value: number, tokenType: LendingTokenType): string => {
  const decimalPlaces = getDecimalPlaces(value, tokenType)
  const formattedValueWithDecimals = value.toFixed(decimalPlaces)
  return formatNumbersWithCommas(formattedValueWithDecimals)
}

export const getDecimalPlaces = (value: number, tokenType: LendingTokenType): number => {
  if (!value) return 0

  const limits = DECIMAL_PLACES_LIMITS[tokenType]
  return find(limits, ({ limit }) => value > limit)?.decimalPlaces ?? DEFAULT_DECIMAL_PLACES
}

export const getTokenDecimals = (tokenType: LendingTokenType): number => {
  return TOKEN_DECIMALS[tokenType]
}

export const getTokenUnit = (tokenType: LendingTokenType): string | JSX.Element => {
  return TOKEN_UNIT[tokenType]
}

export const isSolTokenType = (tokenType: LendingTokenType): boolean =>
  tokenType === LendingTokenType.NativeSol

export const isUsdcTokenType = (tokenType: LendingTokenType): boolean =>
  tokenType === LendingTokenType.Usdc
