import { isNumber, isString } from 'lodash'

import { formatNumbersWithCommas } from '@banx/utils'

import { VALUES_TYPES } from './constants'

import styles from './StatInfo.module.less'

export const formatValue = (
  value: number | string | JSX.Element,
  type: VALUES_TYPES,
  decimalPlaces: number,
  divider = 1,
) => {
  if (!isString(value) && !isNumber(value)) {
    return value
  }

  if (type === VALUES_TYPES.percent) {
    const formattedValue = isNumber(value) ? value?.toFixed(0) : value
    return formattedValue
  }

  if (type === VALUES_TYPES.solPrice) {
    const formattedValue = isString(value) ? parseFloat(value) || 0 : value
    const roundedValue = (formattedValue / divider)?.toFixed(decimalPlaces)

    return formatNumbersWithCommas(roundedValue)
  }

  return value
}

export const getFlexStyle = (flexType?: 'row' | 'column'): string => {
  const flexStyles = {
    row: styles.rowFlex,
    column: styles.columnFlex,
  }

  return flexType ? flexStyles[flexType] : ''
}
