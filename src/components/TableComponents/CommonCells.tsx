import moment from 'moment'

import styles from './TableCells.module.less'

const formatDisplayValue = (initialValue: number, formattedValue: string, unit: string) => {
  return initialValue ? `${formattedValue}${unit}` : '--'
}

export const createSolValueJSX = (initialValue = 0, divider = 1) => {
  const formattedValue = (initialValue / divider).toFixed(2)
  const displayValue = formatDisplayValue(initialValue, formattedValue, '◎')

  return <span className={styles.value}>{displayValue}</span>
}

export const createPercentValueJSX = (initialValue = 0) => {
  const formattedValue = initialValue.toFixed(0)
  const displayValue = formatDisplayValue(initialValue, formattedValue, '%')

  return <span className={styles.value}>{displayValue}</span>
}

export const createTimeValueJSX = (initialValue: number) => {
  const formattedValue = moment.unix(initialValue).fromNow(false)
  const displayValue = formatDisplayValue(initialValue, formattedValue, '')

  return <span className={styles.value}>{displayValue}</span>
}
