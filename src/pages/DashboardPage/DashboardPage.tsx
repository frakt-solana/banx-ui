import { Tabs, useTabs } from '@banx/components/Tabs'

import DashboardBorrowTab from './components/DashboardBorrowTab'
import DashboardHeader from './components/DashboardHeader'
import DashboardLendTab from './components/DashboardLendTab'
import { DASHBOARD_TABS, DEFAULT_TAB_VALUE, DashboardTabName } from './constants'

import styles from './DashboardPage.module.less'

export const DashboardPage = () => {
  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: DASHBOARD_TABS,
    defaultValue: DEFAULT_TAB_VALUE,
  })

  return (
    <div className={styles.pageWrapper}>
      <DashboardHeader />
      <Tabs value={currentTabValue} {...tabsProps} />
      <div className={styles.content}>
        {currentTabValue === DashboardTabName.BORROW && <DashboardBorrowTab />}
        {currentTabValue === DashboardTabName.LEND && <DashboardLendTab />}
      </div>
    </div>
  )
}
