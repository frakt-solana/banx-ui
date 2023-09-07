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

interface SliderProps {
  value: number
  onChange: (nextValue: number) => void
  marks?: { [key: number]: string | JSX.Element }
  step?: number
  className?: string
  disabled?: boolean
}

export const Slider: FC<SliderProps> = ({
  marks = DEFAULT_SLIDER_MARKS,
  step = 1,
  className,
  ...props
}) => {
  return (
    <div className={classNames(styles.slider, className)}>
      <SliderAntd
        rootClassName="rootSliderClassName"
        marks={marks}
        step={step}
        tooltip={{ open: false }}
        {...props}
      />
    </div>
  )
}
