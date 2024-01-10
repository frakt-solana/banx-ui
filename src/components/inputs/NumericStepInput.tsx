import { FC } from 'react'

import classNames from 'classnames'

import { InputArrowUp } from '@banx/icons/InputArrowUp'

import Tooltip from '../Tooltip'
import NumericInput, { NumericInputProps } from './NumericInput'

import styles from './Inputs.module.less'

interface NumericStepInputProps extends NumericInputProps {
  max?: number
  tooltipText?: string
  label?: string
  step?: number
}

export const NumericStepInput: FC<NumericStepInputProps> = ({
  value,
  onChange,
  max = Infinity,
  disabled,
  tooltipText,
  label,
  className,
  step = 0.1,
}) => {
  const numericValue = parseFloat(value) || 0
  const canIncrement = numericValue < max
  const canDecrement = numericValue > 0

  const updateValue = (newNumericValue: number) => {
    const newValue = Math.max(0, Math.min(max, newNumericValue))
    onChange(String(roundToPrecision(newValue)))
  }

  const incrementValue = () => {
    if (canIncrement) {
      updateValue(numericValue + step)
    }
  }

  const decrementValue = () => {
    if (canDecrement) {
      updateValue(numericValue - step)
    }
  }

  const inputElement = (
    <div className={classNames(styles.counterInputContainer, className)}>
      <NumericInput
        value={value}
        onChange={(value) => onChange(value)}
        disabled={disabled}
        positiveOnly
      />
      <div className={styles.customCounterControls}>
        <InputArrowUp
          className={classNames(styles.arrow, { [styles.disabled]: !canIncrement })}
          onClick={incrementValue}
        />
        <div className={styles.separatorLine} />
        <InputArrowUp
          onClick={decrementValue}
          className={classNames(
            styles.arrow,
            { [styles.disabled]: !canDecrement },
            { [styles.rotate]: true },
          )}
        />
      </div>
    </div>
  )

  return label ? (
    <div className={styles.field}>
      <div className={styles.labelWrapper}>
        <span className={styles.label}>{label}</span>
        {tooltipText && <Tooltip title={tooltipText} />}
      </div>
      {inputElement}
    </div>
  ) : (
    inputElement
  )
}

const roundToPrecision = (num: number, precision = 10) => {
  const factor = Math.pow(10, precision)
  return Math.round(num * factor) / factor
}
