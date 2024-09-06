import { FC } from 'react'

import moment from 'moment'

import { useNftTokenType } from '@banx/store/nft'
import {
  TokenUnit,
  formatDecimalWithSubscript,
  formatValueByTokenType,
  getTokenUnit,
} from '@banx/utils'

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

export const createDisplayValueJSX = (value: string, tokenUnit: `${TokenUnit}`) => {
  if (tokenUnit === TokenUnit.Usdc) {
    //? Added dollar sign before '<' for better readability
    //? Change order of the operators to avoid confusion

    const operator = value.startsWith('<') ? '<' : ''
    const cleanedValue = value.replace('<', '')

    return (
      <span className={styles.displayValue}>
        {operator}
        {tokenUnit}
        {cleanedValue}
      </span>
    )
  }

  return (
    <span className={styles.displayValue}>
      {value}
      {tokenUnit}
    </span>
  )
}

interface DisplayValueProps {
  value: number
  placeholder?: string
  isSubscriptFormat?: boolean
}

export const DisplayValue: FC<DisplayValueProps> = ({
  value,
  placeholder,
  isSubscriptFormat = false,
}) => {
  const { tokenType } = useNftTokenType()

  const formattedValue = isSubscriptFormat
    ? formatDecimalWithSubscript(value)
    : formatValueByTokenType(value, tokenType)

  const tokenUnit = getTokenUnit(tokenType)
  const defaultPlaceholder = placeholder ?? createDisplayValueJSX('0', tokenUnit)

  return formattedValue ? createDisplayValueJSX(formattedValue, tokenUnit) : defaultPlaceholder
}
