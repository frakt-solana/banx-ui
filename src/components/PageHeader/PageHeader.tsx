import { FC, PropsWithChildren } from 'react'

import classNames from 'classnames'

import { StatInfo, StatsInfoProps } from '../StatInfo'

import styles from './PageHeader.module.less'

interface PageHeaderProps {
  title: string
  titleBtn?: JSX.Element
  tokenSwitcher?: JSX.Element
  className?: string
}

export const PageHeaderBackdrop: FC<PropsWithChildren<PageHeaderProps>> = ({
  title,
  titleBtn,
  tokenSwitcher,
  className,
  children,
}) => (
  <div className={classNames(styles.container, className)}>
    <div className={styles.titleWrapper}>
      <h2 className={styles.title}>{title}</h2>
      {tokenSwitcher}
      {titleBtn}
    </div>

    <div className={styles.content}>{children}</div>
  </div>
)

export const MainStat: FC<StatsInfoProps> = (props) => {
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
