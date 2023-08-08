import { isNumber, isString } from 'lodash'

import { formatNumbersWithCommas } from '@banx/utils'

import { VALUES_TYPES } from './constants'

export const formatValue = (
  value: number | string | JSX.Element,
  type: VALUES_TYPES,
  decimalPlaces: number,
  divider = 1,
) => {
  if (!isString(value) && !isNumber(value)) {
    return value
  }

  if (type === VALUES_TYPES.PERCENT) {
    const formattedValue = isNumber(value) ? value?.toFixed(0) : value
    return formattedValue
  }

  if (type === VALUES_TYPES.SOLPRICE) {
    const formattedValue = isString(value) ? parseFloat(value) || 0 : value
    const roundedValue = (formattedValue / divider)?.toFixed(decimalPlaces)

    return formatNumbersWithCommas(roundedValue)
  }

  return value
}
