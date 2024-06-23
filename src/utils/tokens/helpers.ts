import { ReactNode } from 'react'

import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { find } from 'lodash'

import { formatNumbersWithCommas } from '../common'
import {
  DECIMAL_PLACES_LIMITS,
  DEFAULT_DECIMAL_PLACES,
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
