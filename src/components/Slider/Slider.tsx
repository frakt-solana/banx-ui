import { FC } from 'react'

import { Slider as SliderAntd } from 'antd'
import classNames from 'classnames'
import { chain } from 'lodash'

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
  showValue?: 'number' | 'percent' | 'sol'
}

//? Described in global silder.less file
const SLIDER_WITH_VALUE_CLASSNAME = {
  number: 'sliderWithValue',
  percent: 'sliderWithValuePercent',
  sol: 'sliderWithValueSol',
}

export const Slider: FC<SliderProps> = ({
  label,
  labelClassName,
  marks = DEFAULT_SLIDER_MARKS,
  step = 1,
  className,
  rootClassName,
  showValue,
  ...props
}) => {
  //? Show marks without text when showValue exists
  const marksFormatted = showValue
    ? chain(marks)
        .entries()
        .map(([label]) => [label, ' '])
        .fromPairs()
        .value()
    : marks

  return (
    <div className={classNames(styles.slider, { [styles.sliderWithValue]: showValue }, className)}>
      {!!label && <p className={classNames(styles.label, labelClassName)}>{label}</p>}
      <SliderAntd
        rootClassName={classNames(
          'rootSliderClassName',
          { [SLIDER_WITH_VALUE_CLASSNAME[showValue || 'number']]: !!showValue },
          rootClassName,
        )}
        marks={marksFormatted}
        step={step}
        tooltip={{
          open: false,
        }}
        {...props}
      />
    </div>
  )
}
