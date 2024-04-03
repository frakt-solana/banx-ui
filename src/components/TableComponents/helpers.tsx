import { FC } from 'react'

import moment from 'moment'

import { USDC } from '@banx/icons'
import { TokenType, useToken } from '@banx/store'
import { formatValueByTokenType } from '@banx/utils'

import styles from './TableCells.module.less'

const formatDisplayValue = (
  initialValue: number,
  formattedValue: string,
  unit: string,
  zeroPlaceholder = '--',
) => {
  return initialValue ? `${formattedValue}${unit}` : zeroPlaceholder
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

const DEFAULT_PLACEHOLDERS = {
  [TokenType.SOL]: '0◎',
  [TokenType.USDC]: (
    <>
      0 <USDC />
    </>
  ),
}

const DEFAULT_UNITS = {
  [TokenType.SOL]: '◎',
  [TokenType.USDC]: <USDC />,
}

export const DisplayValue: FC<{ value: number; placeholder?: string }> = ({
  value,
  placeholder,
}) => {
  const { token: tokenType } = useToken()

  const formattedValue = formatValueByTokenType(value, tokenType)

  const defaultPlaceholder = placeholder || DEFAULT_PLACEHOLDERS[tokenType]
  const unit = DEFAULT_UNITS[tokenType]

  const displayValue = formattedValue ? (
    <>
      {formattedValue} {unit}
    </>
  ) : (
    defaultPlaceholder
  )

  return <span className={styles.displayValue}>{displayValue}</span>
}
