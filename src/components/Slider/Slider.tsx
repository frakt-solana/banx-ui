import { FC } from 'react'

import { Slider as SliderAntd } from 'antd'
import classNames from 'classnames'
import { chain } from 'lodash'

import Tooltip from '../Tooltip'

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
  tooltipText?: string
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
  tooltipText,
  disabled,
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
      {!!label && (
        <div className={styles.labels}>
          <p className={classNames(styles.label, labelClassName)}>{label}</p>
          {tooltipText && <Tooltip title={tooltipText} />}
        </div>
      )}
      <SliderAntd
        rootClassName={classNames(
          'rootSliderClassName',
          { [SLIDER_WITH_VALUE_CLASSNAME[showValue || 'number']]: !!showValue },
          { ['sliderDisabled']: disabled },
          rootClassName,
        )}
        marks={marksFormatted}
        disabled={disabled}
        step={step}
        tooltip={{
          open: false,
        }}
        {...props}
      />
    </div>
  )
}
