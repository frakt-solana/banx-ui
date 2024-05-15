import { FC, ReactNode } from 'react'

import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'

import { USDC } from '@banx/icons'
import { useTokenType } from '@banx/store'
import { formatValueByTokenType, getTokenUnit } from '@banx/utils'

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

const createPlaceholderJSX = (value: number, tokenUnit: ReactNode) => (
  <>
    <span className={styles.value}>{value}</span>
    <span className={styles.tokenUnit}>{tokenUnit}</span>
  </>
)

const DEFAULT_PLACEHOLDERS = {
  [LendingTokenType.NativeSol]: createPlaceholderJSX(0, '◎'),
  [LendingTokenType.BanxSol]: createPlaceholderJSX(0, '◎'),
  [LendingTokenType.Usdc]: createPlaceholderJSX(0, <USDC />),
}

export const DisplayValue: FC<{ value: number; placeholder?: string }> = ({
  value,
  placeholder,
}) => {
  const { tokenType } = useTokenType()

  const formattedValue = formatValueByTokenType(value, tokenType)

  const defaultPlaceholder = placeholder || DEFAULT_PLACEHOLDERS[tokenType]
  const tokenUnit = getTokenUnit(tokenType)

  const displayValue = formattedValue ? (
    <>
      <span className={styles.value}>{formattedValue}</span>
      <span className={styles.tokenUnit}>{tokenUnit}</span>
    </>
  ) : (
    defaultPlaceholder
  )

  return <div className={styles.displayValue}>{displayValue}</div>
}
