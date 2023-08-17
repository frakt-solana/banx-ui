import { CSSProperties, FC } from 'react'

import classNames from 'classnames'

import Tooltip from '../Tooltip'
import { DIMENSION_BY_VALUE_TYPE, VALUES_TYPES } from './constants'
import { formatValue } from './helpers'

import styles from './StatInfo.module.less'

interface ClassNamesProps {
  container: string
  label: string
  value: string
}

export interface StatsInfoProps {
  value: number | string | JSX.Element

  label?: string
  secondValue?: string
  tooltipText?: string
  valueType?: VALUES_TYPES
  decimalPlaces?: number
  divider?: number
  flexType?: 'row' | 'column'
  valueStyles?: CSSProperties
  classNamesProps?: Partial<ClassNamesProps>
}

export const StatInfo: FC<StatsInfoProps> = ({
  label,
  value,
  tooltipText,
  secondValue,
  valueType = VALUES_TYPES.SOLPRICE,
  decimalPlaces = 2,
  divider,
  flexType = 'column',
  classNamesProps,
  valueStyles,
}) => {
  const formattedValue = formatValue(value, valueType, decimalPlaces, divider)
  const dimension = DIMENSION_BY_VALUE_TYPE[valueType]
  const flexStyle = flexType === 'row' ? styles.rowFlex : styles.columnFlex

  const containerClasses = classNames(flexStyle, classNamesProps?.container)
  const labelClasses = classNames(styles.label, classNamesProps?.label)
  const valueClasses = classNames(styles.value, classNamesProps?.value)

  return (
    <div className={containerClasses}>
      <div className={styles.labelWrapper}>
        <span className={labelClasses}>{label}</span>
        {tooltipText && <Tooltip title={tooltipText} />}
      </div>
      <span className={valueClasses} style={valueStyles}>
        {formattedValue}
        {dimension}
      </span>
      {renderSecondValue(flexType, secondValue)}
    </div>
  )
}

const renderSecondValue = (flexType: string, secondValue?: string) => {
  if (flexType !== 'row' && secondValue) {
    return <span className={styles.secondValue}>{secondValue}</span>
  }
  return null
}
