import { FC } from 'react'

import NumericArrowsInput from '../inputs/NumericArrowsInput'
import { Slider, SliderProps } from './Slider'

import styles from './Slider.module.less'

export const CounterSlider: FC<SliderProps> = ({
  value,
  onChange,
  max = 0,
  label,
  labelClassName,
  rootClassName,
}) => {
  return (
    <div className={styles.couterSliderContainer}>
      <Slider
        className={styles.counterSlider}
        value={value}
        onChange={onChange}
        marks={{}}
        max={max}
        label={label}
        labelClassName={labelClassName}
        rootClassName={rootClassName}
      />
      <NumericArrowsInput onChange={onChange} value={value} max={max} />
    </div>
  )
}
