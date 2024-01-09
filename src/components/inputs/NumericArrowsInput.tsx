import React, { FC } from 'react'

import classNames from 'classnames'

import { InputArrowUp } from '@banx/icons/InputArrowUp'

import NumericInput from './NumericInput'

import styles from './Inputs.module.less'

interface NumericArrowsInputProps {
  value: number
  onChange: (value: number) => void
  max?: number
}

const NumericArrowsInput: FC<NumericArrowsInputProps> = ({ value, onChange, max = 0 }) => {
  const canIncrement = value < max
  const canDecrement = value > 0

  const incrementValue = () => {
    if (canIncrement) {
      onChange(value + 1)
    }
  }

  const decrementValue = () => {
    if (canDecrement) {
      onChange(value - 1)
    }
  }

  return (
    <div className={styles.counterInputContainer}>
      <NumericInput
        className={styles.counterInput}
        value={String(value)}
        onChange={(value) => onChange(Number(value))}
        positiveOnly
        integerOnly
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
}

export default NumericArrowsInput
