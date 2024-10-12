import { FC } from 'react'

import { Slider, SliderProps } from '@banx/components/Slider'

import { HealthColorIncreasing, getColorByPercent } from '@banx/utils'

import styles from '../BorrowTokenPage.module.less'

export * from './InputTokenSelect'

interface LoanValueSliderProps extends SliderProps {
  value: number
  onChange: (value: number) => void
  label: string
}

export const LoanValueSlider: FC<LoanValueSliderProps> = ({ label, value, onChange, ...props }) => {
  const colorClassNameByValue = {
    25: styles.maxLtvSliderGreen,
    50: styles.maxLtvSliderYellow,
    75: styles.maxLtvSliderOrange,
    100: styles.maxLtvSliderRed,
  }

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.sliderLabels}>
        <p className={styles.loanValueLabel}>
          {label}:{' '}
          <span
            className={styles.loanValue}
            style={{ color: getColorByPercent(value, HealthColorIncreasing) }}
          >
            {value}%
          </span>
        </p>
      </div>

      <Slider
        value={value}
        onChange={onChange}
        min={10}
        max={100}
        marks={{}}
        rootClassName={getColorByPercent(value, colorClassNameByValue)}
        className={styles.ltvSlider}
        {...props}
      />
    </div>
  )
}

export const Separator = () => {
  return <div className={styles.separator} />
}
