import { FC } from 'react'

import { StatInfo, StatsInfoProps } from '@banx/components/StatInfo'

import styles from './DashboardStatInfo.module.less'

export const DashboardStatInfo: FC<StatsInfoProps> = (props) => {
  const { classNamesProps, ...rest } = props

  const defaultClassNames = {
    container: styles.mainContainer,
    value: styles.mainValue,
    label: styles.mainLabel,
  }

  const mergedClassNames = {
    ...defaultClassNames,
    ...classNamesProps,
  }

  return <StatInfo {...rest} classNamesProps={mergedClassNames} />
}

interface ChartStatInfoProps {
  label: string
  value: string
  indicatorColor: string
}

export const ChartStatInfo: FC<ChartStatInfoProps> = ({ value, label, indicatorColor }) => {
  return (
    <div className={styles.chartStatInfo}>
      <span className={styles.chartStatInfoValue}>{value}</span>
      <div className={styles.chartStatInfoLabelWrapper}>
        <span className={styles.chartStatInfoLabel}>{label}</span>
        <span style={{ background: indicatorColor }} className={styles.chartStatInfoIndicator} />
      </div>
    </div>
  )
}
