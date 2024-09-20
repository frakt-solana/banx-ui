import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { useOnboardingModal } from '@banx/hooks'

import DashboardBorrowTab from './components/DashboardBorrowTab'
import DashboardHeader from './components/DashboardHeader'
import DashboardLendTab from './components/DashboardLendTab'

import styles from './DashboardPage.module.less'

export const DashboardPage = () => {
  useOnboardingModal('dashboard')

  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: TABS,
    defaultValue: TabName.BORROW,
  })

  return (
    <div className={styles.pageWrapper}>
      <DashboardHeader />
      <Tabs value={currentTabValue} {...tabsProps} />
      <div className={styles.content}>
        {currentTabValue === TabName.BORROW && <DashboardBorrowTab />}
        {currentTabValue === TabName.LEND && <DashboardLendTab />}
      </div>
    </div>
  )
}

enum TabName {
  BORROW = 'borrow',
  LEND = 'lend',
}

const TABS: Tab[] = [
  {
    label: 'Borrow',
    value: TabName.BORROW,
  },
  {
    label: 'Lend',
    value: TabName.LEND,
  },
]
