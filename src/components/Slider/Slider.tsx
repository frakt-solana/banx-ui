import { FC } from 'react'

import { Slider as SliderAntd } from 'antd'
import classNames from 'classnames'

import styles from './Slider.module.less'

const DEFAULT_SLIDER_MARKS = {
  0: '0%',
  25: '25%',
  50: '50%',
  75: '75%',
  100: '100%',
}

export interface SliderProps {
  label?: string
  labelClassName?: string
  value: number
  onChange: (nextValue: number) => void
  marks?: { [key: number]: string | JSX.Element }
  step?: number
  max?: number
  min?: number
  className?: string
  rootClassName?: string
  disabled?: boolean
}

export const Slider: FC<SliderProps> = ({
  label,
  labelClassName,
  marks = DEFAULT_SLIDER_MARKS,
  step = 1,
  className,
  rootClassName,
  ...props
}) => {
  return (
    <div className={classNames(styles.slider, className)}>
      {!!label && <p className={classNames(styles.label, labelClassName)}>{label}</p>}
      <SliderAntd
        rootClassName={classNames('rootSliderClassName', rootClassName)}
        marks={marks}
        step={step}
        tooltip={{ open: false }}
        {...props}
      />
    </div>
  )
}
