import { ReactNode } from 'react'

import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { find, findIndex, repeat } from 'lodash'

import { formatNumbersWithCommas } from '../common'
import {
  COLLATERAL_DECIMAL_PLACES_LIMITS,
  DECIMAL_PLACES_LIMITS,
  DEFAULT_DECIMAL_PLACES,
  MIN_COLLATERAL_VALUE_TO_DISPLAY,
  MIN_VALUE_TO_DISPLAY,
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

  if (isValueBelowThreshold(convertedValue, MIN_VALUE_TO_DISPLAY[tokenType])) {
    return `<${MIN_VALUE_TO_DISPLAY[tokenType]}`
  }

  return formatTokenValue(convertedValue, tokenType)
}

export const formatDecimalWithoutTrailingZeros = (
  value: number,
  tokenType: LendingTokenType,
): string => {
  const decimalPlaces = getDecimalPlaces(value, tokenType)
  const formattedValueWithDecimals = value.toFixed(decimalPlaces)
  return formattedValueWithDecimals.replace(/\.00$/, '')
}

export const formatTokenValue = (value: number, tokenType: LendingTokenType): string => {
  const formattedValueWithoutTrailingZeros = formatDecimalWithoutTrailingZeros(value, tokenType)
  return formatNumbersWithCommas(formattedValueWithoutTrailingZeros)
}

export const getDecimalPlaces = (value: number, tokenType: LendingTokenType): number => {
  if (!value) return 0

  const limits = DECIMAL_PLACES_LIMITS[tokenType]
  return find(limits, ({ limit }) => value > limit)?.decimalPlaces ?? DEFAULT_DECIMAL_PLACES
}

export const getTokenDecimals = (tokenType: LendingTokenType): number => {
  return TOKEN_DECIMALS[tokenType]
}

export const getTokenUnit = (tokenType: LendingTokenType): ReactNode => {
  return TOKEN_UNIT[tokenType]
}

export const isSolTokenType = (tokenType: LendingTokenType): boolean =>
  tokenType === LendingTokenType.NativeSol

export const isUsdcTokenType = (tokenType: LendingTokenType): boolean =>
  tokenType === LendingTokenType.Usdc

export const isBanxSolTokenType = (tokenType: LendingTokenType): boolean =>
  tokenType === LendingTokenType.BanxSol

const MAX_FORMATTED_LENGTH = 4

export const formatDecimalWithSubscript = (decimalNumber: number) => {
  const decimalAsString = decimalNumber.toString()
  const [integerPart, fractionalPart] = decimalAsString.split('.')

  if (parseFloat(integerPart) > 0) {
    return decimalNumber.toFixed(MAX_FORMATTED_LENGTH)
  }

  if (!fractionalPart) {
    return decimalAsString
  }

  const countLeadingZeros = findIndex(fractionalPart, (digit) => digit !== '0')

  const convertToSubscript = (value: number): string => {
    const subscripts = '₀₁₂₃₄₅₆₇₈₉'
    return value
      .toString()
      .split('')
      .map((digit) => subscripts[parseFloat(digit)])
      .join('')
  }

  const MIN_LEADING_ZEROS_FOR_SUBSCRIPT = 2
  const leadingZerosSubscript =
    countLeadingZeros > MIN_LEADING_ZEROS_FOR_SUBSCRIPT
      ? `0${convertToSubscript(countLeadingZeros)}`
      : repeat('0', countLeadingZeros)

  const remainingFraction = fractionalPart.slice(countLeadingZeros)

  const formattedDecimal = `${leadingZerosSubscript}${remainingFraction}`.slice(
    0,
    MAX_FORMATTED_LENGTH,
  )

  return `0.${formattedDecimal}`
}

export const formatCollateralTokenValue = (value: number) => {
  if (isValueBelowThreshold(value, MIN_COLLATERAL_VALUE_TO_DISPLAY)) {
    return value
  }

  const decimalPlaces =
    find(COLLATERAL_DECIMAL_PLACES_LIMITS, ({ limit }) => value > limit)?.decimalPlaces ??
    DEFAULT_DECIMAL_PLACES

  const formattedValueWithDecimals = value.toFixed(decimalPlaces)
  return formattedValueWithDecimals.replace(/\.00$/, '')
}
