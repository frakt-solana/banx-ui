import { FC } from 'react'

import classNames from 'classnames'

import { Slider, SliderProps } from '@banx/components/Slider'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { DisplayValue } from '@banx/components/TableComponents'

import { HealthColorIncreasing, getColorByPercent } from '@banx/utils'

import styles from './InstantBorrowContent.module.less'

interface SummaryProps {
  apr: number
  upfrontFee: number
  weeklyInterest: number
}

export const Summary: FC<SummaryProps> = ({ apr, upfrontFee, weeklyInterest }) => {
  const statClassNames = {
    value: styles.fixedStatValue,
  }

  return (
    <div className={styles.summary}>
      <StatInfo
        label="Upfront fee"
        value={<DisplayValue value={upfrontFee} />}
        tooltipText="1% upfront fee charged on the loan principal amount, paid when loan is funded"
        classNamesProps={statClassNames}
        flexType="row"
      />
      <StatInfo
        label="Est weekly fee"
        value={<DisplayValue value={weeklyInterest} />}
        tooltipText="Expected weekly interest on your loans. Interest is added to your debt balance"
        classNamesProps={statClassNames}
        flexType="row"
      />
      <StatInfo
        label="APR"
        value={apr}
        valueType={VALUES_TYPES.PERCENT}
        classNamesProps={statClassNames}
        flexType="row"
      />
    </div>
  )
}

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
