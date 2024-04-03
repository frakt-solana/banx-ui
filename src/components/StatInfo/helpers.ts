import { isNumber, isString } from 'lodash'

import { VALUES_TYPES } from './constants'

export const formatValue = (value: number | string | JSX.Element, type: VALUES_TYPES) => {
  if (!isString(value) && !isNumber(value)) {
    return value
  }

  if (type === VALUES_TYPES.PERCENT) {
    const formattedValue = isNumber(value) ? value?.toFixed(0) : value
    return formattedValue
  }

  return value
}
