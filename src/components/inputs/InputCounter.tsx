import { FC } from 'react'

import { MinusOutlined, PlusOutlined } from '@ant-design/icons'
import classNames from 'classnames'

import NumericInput, { NumericInputProps } from './NumericInput'

import styles from './Inputs.module.less'

interface CounterButtonProps {
  onClick: () => void
  disabled?: boolean
  icon: FC
}

const CounterButton: FC<CounterButtonProps> = ({ onClick, disabled, icon: Icon }) => (
  <div
    onClick={onClick}
    className={classNames(styles.counterButton, {
      [styles.disabled]: disabled,
    })}
  >
    <Icon />
  </div>
)

const useInputCounter = (initialValue: string, onChange: (nextValue: string) => void) => {
  const parseValueToFloat = (value: string): number => {
    const parsedValue = parseFloat(value)
    return isNaN(parsedValue) ? 0 : parsedValue
  }

  const updateValue = (nextValue: number) => {
    const parsedValue = parseValueToFloat(initialValue)
    const updatedValue = (parsedValue + nextValue).toString()
    onChange(updatedValue)
  }

  const increaseValue = () => {
    updateValue(1)
  }

  const decreaseValue = () => {
    updateValue(-1)
  }

  const isValueGreaterThanOne = parseValueToFloat(initialValue) > 1

  return {
    value: initialValue,
    onChange,
    increaseValue,
    decreaseValue,
    isValueGreaterThanOne,
    parseValueToFloat,
  }
}

interface InputCounterProps extends NumericInputProps {
  label: string
}

export const InputCounter: FC<InputCounterProps> = ({
  value,
  onChange,
  placeholder = '0',
  label,
  disabled,
  className,
}) => {
  const { increaseValue, decreaseValue, isValueGreaterThanOne } = useInputCounter(value, onChange)

  return (
    <div className={classNames(styles.field, className)}>
      <span className={styles.label}>{label}</span>
      <div className={styles.inputCounterWrapper}>
        <CounterButton
          disabled={!isValueGreaterThanOne || disabled}
          onClick={decreaseValue}
          icon={MinusOutlined}
        />
        <NumericInput
          className={styles.inputCounter}
          placeholder={placeholder}
          onChange={onChange}
          disabled={disabled}
          value={value}
          positiveOnly
          integerOnly
        />
        <CounterButton onClick={increaseValue} icon={PlusOutlined} disabled={disabled} />
      </div>
    </div>
  )
}
