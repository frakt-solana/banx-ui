import { FC } from 'react'

import { InputArrowUp } from '@banx/icons/InputArrowUp'

import NumericInput from '../inputs/NumericInput'
import { Slider, SliderProps } from './Slider'

import styles from './Slider.module.less'

export const CounterSlider: FC<SliderProps> = ({ value, onChange, max = 0 }) => {
  const incrementValue = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  const decrementValue = () => {
    if (value > 0) {
      onChange(value - 1)
    }
  }

  return (
    <div className={styles.couterSliderContainer}>
      <Slider
        className={styles.counterSlider}
        value={value}
        onChange={onChange}
        marks={{}}
        max={max}
      />
      <div className={styles.counterInputContainer}>
        <NumericInput
          className={styles.counterInput}
          value={String(value)}
          onChange={(value) => onChange(Number(value))}
          positiveOnly
          integerOnly
        />
        <div className={styles.customCounterControls}>
          <InputArrowUp onClick={incrementValue} />
          <div className={styles.separatorLine} />
          <InputArrowUp onClick={decrementValue} className={styles.rotate} />
        </div>
      </div>
    </div>
  )
}
