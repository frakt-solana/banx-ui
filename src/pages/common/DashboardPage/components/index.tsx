import { FC, ReactNode } from 'react'

import classNames from 'classnames'

import styles from '../DashboardPage.module.less'

interface ChartStatProps {
  label: string
  value: ReactNode
  indicatorColor: string
  className?: string
}

export const ChartStat: FC<ChartStatProps> = ({ value, label, className, indicatorColor }) => (
  <div className={classNames(styles.chartStatInfo, className)}>
    <span className={styles.chartStatInfoValue}>{value}</span>
    <div className={styles.chartStatInfoLabelWrapper}>
      <span className={styles.chartStatInfoLabel}>{label}</span>
      <span style={{ background: indicatorColor }} className={styles.chartStatInfoIndicator} />
    </div>
  </div>
)
