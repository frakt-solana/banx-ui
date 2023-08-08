import { FC } from 'react'

import classNames from 'classnames'

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
  hasError?: boolean
}

export const NumericInputField: FC<NumericInputFieldProps> = ({
  value,
  onChange,
  placeholder,
  label,
  className,
  showIcon = true,
  integerOnly = false,
  hasError,
}) => {
  return (
    <div className={classNames(styles.field, className)}>
      <span className={styles.label}>{label}</span>
      <div className={classNames(styles.numericInputWrapper, { [styles.inputError]: hasError })}>
        <NumericInput
          value={value}
          integerOnly={integerOnly}
          onChange={onChange}
          placeholder={placeholder}
          positiveOnly
        />
        {showIcon && <div className={styles.selectTokenBtn}>◎</div>}
      </div>
    </div>
  )
}
