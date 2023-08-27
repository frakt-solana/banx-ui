import moment from 'moment'

import styles from './TableCells.module.less'

const formatDisplayValue = (
  initialValue: number,
  formattedValue: string,
  unit: string,
  zeroPlaceholder = '--',
) => {
  return initialValue ? `${formattedValue}${unit}` : zeroPlaceholder
}

export const createSolValueJSX = (initialValue = 0, divider = 1, zeroPlaceholder = '--') => {
  const formattedValue = (initialValue / divider).toFixed(2)
  const displayValue = formatDisplayValue(initialValue, formattedValue, '◎', zeroPlaceholder)

  return <span className={styles.value}>{displayValue}</span>
}

export const createPercentValueJSX = (initialValue = 0, zeroPlaceholder = '--') => {
  const formattedValue = initialValue.toFixed(0)
  const displayValue = formatDisplayValue(initialValue, formattedValue, '%', zeroPlaceholder)

  return <span className={styles.value}>{displayValue}</span>
}

export const createTimeValueJSX = (initialValue: number, zeroPlaceholder = '--') => {
  const formattedValue = moment.unix(initialValue).fromNow(false)
  const displayValue = formatDisplayValue(initialValue, formattedValue, '', zeroPlaceholder)

  return <span className={styles.value}>{displayValue}</span>
}
