import { FC } from 'react'

import classNames from 'classnames'

import styles from './Tabs.module.less'

export interface Tab {
  label: string
  value: string
  disabled?: boolean
}

export interface TabsProps {
  tabs: Tab[]
  value: string
  setValue: (value: string) => void
  className?: string
  type?: 'primary'
  onTabClick?: (tabProps: Tab) => void
}

export const Tabs: FC<TabsProps> = ({
  tabs,
  value,
  setValue,
  className,
  type = 'primary',
  onTabClick,
}) => {
  const handleTabClick = (tabProps: Tab) => {
    onTabClick?.(tabProps)
    setValue(tabProps.value)
  }

  return (
    <div className={classNames(styles.tabsWrapper, className)}>
      {tabs.map(({ label, value: tabValue, disabled }) => {
        const isActive = tabValue === value
        const tabClasses = classNames(styles.root, styles[type], { [styles.tabActive]: isActive })

        return (
          <button
            key={tabValue}
            className={tabClasses}
            name={tabValue}
            onClick={() => handleTabClick({ label, value: tabValue, disabled })}
            disabled={disabled}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
