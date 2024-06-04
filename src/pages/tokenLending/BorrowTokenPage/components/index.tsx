import { FC } from 'react'

import classNames from 'classnames'

import { Slider, SliderProps } from '@banx/components/Slider'

import { HealthColorIncreasing, getColorByPercent } from '@banx/utils'

import styles from '../BorrowTokenPage.module.less'

export * from './InputTokenSelect'

interface LtvSliderProps extends SliderProps {
  value: number
  onChange: (value: number) => void
}

export const LtvSlider: FC<LtvSliderProps> = ({ value, onChange, ...props }) => {
  const colorClassNameByValue = {
    25: styles.maxLtvSliderGreen,
    50: styles.maxLtvSliderYellow,
    75: styles.maxLtvSliderOrange,
    100: styles.maxLtvSliderRed,
  }

  return (
    <div className={styles.ltvSliderContainer}>
      <p className={styles.ltvSliderLabel}>
        LTV:{' '}
        <span style={{ color: getColorByPercent(value, HealthColorIncreasing) }}>{value}%</span>
      </p>
      <Slider
        value={value}
        onChange={onChange}
        min={10}
        max={100}
        marks={{}}
        rootClassName={getColorByPercent(value, colorClassNameByValue)}
        className={classNames(styles.ltvSlider, styles.ltvSlider)}
        {...props}
      />
    </div>
  )
}

export const Separator = () => {
  return <div className={styles.separator} />
}
