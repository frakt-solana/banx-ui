import { FC } from 'react'

import classNames from 'classnames'

import { SearchSelect, SearchSelectProps } from '@banx/components/SearchSelect'
import { StatInfo, StatsInfoProps } from '@banx/components/StatInfo'

import styles from '../DashboardPage.module.less'

interface SearchableHeadingProps<T> {
  title: string
  searchSelectParams: SearchSelectProps<T>
}

export const SearchableHeading = <T extends object>({
  title,
  searchSelectParams,
}: SearchableHeadingProps<T>) => (
  <div className={styles.searchableHeadingWrapper}>
    <h4 className={styles.searchableHeading}>{title}</h4>
    <SearchSelect className={styles.searchSelect} {...searchSelectParams} />
  </div>
)

export const Heading = ({ title }: { title: string }) => <h4 className={styles.heading}>{title}</h4>

interface ChartStatInfoProps {
  label: string
  value: string | number | JSX.Element
  indicatorColor: string
  className?: string
}

export const ChartStatInfo: FC<ChartStatInfoProps> = ({
  value,
  label,
  className,
  indicatorColor,
}) => (
  <div className={classNames(styles.chartStatInfo, className)}>
    <span className={styles.chartStatInfoValue}>{value}</span>
    <div className={styles.chartStatInfoLabelWrapper}>
      <span className={styles.chartStatInfoLabel}>{label}</span>
      <span style={{ background: indicatorColor }} className={styles.chartStatInfoIndicator} />
    </div>
  </div>
)

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
