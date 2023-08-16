import { FC, PropsWithChildren } from 'react'

import { StatInfo, StatsInfoProps } from '../StatInfo'

import styles from './PageHeader.module.less'

interface PageHeaderProps {
  title: string
}

export const PageHeaderBackdrop: FC<PropsWithChildren<PageHeaderProps>> = ({ title, children }) => (
  <div className={styles.container}>
    <h2 className={styles.title}>{title}</h2>
    <div className={styles.content}>{children}</div>
  </div>
)

export const MainStat: FC<StatsInfoProps> = (props) => (
  <StatInfo
    classNamesProps={{
      container: styles.mainContainer,
      value: styles.mainValue,
      label: styles.mainLabel,
    }}
    {...props}
  />
)

export const AdditionalStat: FC<StatsInfoProps> = (props) => (
  <StatInfo
    classNamesProps={{
      container: styles.additionalContainer,
      value: styles.additionalValue,
      label: styles.additionalLabel,
    }}
    {...props}
  />
)

export const SeparateStatsLine = () => <div className={styles.separateLine} />
