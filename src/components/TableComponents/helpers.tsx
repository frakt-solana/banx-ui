import { FC, ReactNode } from 'react'

import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import moment from 'moment'

import { USDC } from '@banx/icons'
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

const createPlaceholderJSX = (value: number, tokenUnit: ReactNode) => (
  <>
    <span className={styles.value}>{value}</span>
    <span className={styles.tokenUnit}>{tokenUnit}</span>
  </>
)

const TOKEN_DETAILS = {
  [LendingTokenType.NativeSol]: {
    unit: '◎',
    placeholder: createPlaceholderJSX(0, '◎'),
  },
  [LendingTokenType.BanxSol]: {
    unit: '◎',
    placeholder: createPlaceholderJSX(0, '◎'),
  },
  [LendingTokenType.Usdc]: {
    //? Using viewBox to visually scale up icon without changing its size
    unit: <USDC viewBox="0 1 15 15" />,
    placeholder: createPlaceholderJSX(0, <USDC viewBox="0 1 15 15" />),
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
