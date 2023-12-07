import { FC } from 'react'

import classNames from 'classnames'

import Tooltip from '../Tooltip'
import NumericInput from './NumericInput'

import styles from './Inputs.module.less'

interface NumericInputFieldProps {
  label: string
  value: string
  onChange: (nextValue: string) => void
  placeholder?: string
  className?: string
  showIcon?: boolean
  integerOnly?: boolean
  disabled?: boolean
  tooltipText?: string
}

export const NumericInputField: FC<NumericInputFieldProps> = ({
  value,
  onChange,
  placeholder,
  label,
  className,
  showIcon = true,
  integerOnly = false,
  disabled,
  tooltipText,
}) => {
  return (
    <div className={classNames(styles.field, className)}>
      <div className={styles.labelWrapper}>
        <span className={styles.label}>{label}</span>
        {tooltipText && <Tooltip title={tooltipText} />}
      </div>
      <div className={styles.numericInputWrapper}>
        <NumericInput
          value={value}
          integerOnly={integerOnly}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          positiveOnly
        />
        {showIcon && <div className={styles.selectTokenBtn}>◎</div>}
      </div>
    </div>
  )
}
