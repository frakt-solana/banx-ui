import { FC, ReactNode } from 'react'

import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'

import { useNftTokenType } from '@banx/store/nft'
import { formatDecimalWithSubscript, formatValueByTokenType } from '@banx/utils'

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

const createDisplayValueJSX = (value: ReactNode, tokenUnit: ReactNode) => (
  <span className={styles.displayValue}>
    {value}
    {tokenUnit}
  </span>
)

const TOKEN_DETAILS = {
  [LendingTokenType.NativeSol]: {
    unit: '◎',
    placeholder: createDisplayValueJSX(0, '◎'),
  },
  [LendingTokenType.BanxSol]: {
    unit: '◎',
    placeholder: createDisplayValueJSX(0, '◎'),
  },
  [LendingTokenType.Usdc]: {
    unit: '$',
    placeholder: createDisplayValueJSX(0, '$'),
  },
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

  const defaultPlaceholder = placeholder || TOKEN_DETAILS[tokenType].placeholder
  const tokenUnit = TOKEN_DETAILS[tokenType].unit

  return formattedValue ? createDisplayValueJSX(formattedValue, tokenUnit) : defaultPlaceholder
}
