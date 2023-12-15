import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { useOnboardingModal } from '@banx/hooks'
import { toLowerCaseNoSpaces, trackPageEvent, useMixpanelLocationTrack } from '@banx/utils'

import DashboardBorrowTab from './components/DashboardBorrowTab'
import DashboardHeader from './components/DashboardHeader'
import DashboardLendTab from './components/DashboardLendTab'

import styles from './DashboardPage.module.less'

enum DashboardTabName {
  BORROW = 'borrow',
  LEND = 'lend',
}

export const DashboardPage = () => {
  useMixpanelLocationTrack('dashboard')

  const onTabClick = (tabProps: Tab) => {
    trackPageEvent('dashboard', `${toLowerCaseNoSpaces(tabProps.label)}tab`)
  }

  useOnboardingModal('dashboard')

  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: DASHBOARD_TABS,
    defaultValue: DASHBOARD_TABS[0].value,
  })

  return (
    <div className={styles.pageWrapper}>
      <DashboardHeader />
      <Tabs value={currentTabValue} {...tabsProps} onTabClick={onTabClick} />
      <div className={styles.content}>
        {currentTabValue === DashboardTabName.BORROW && <DashboardBorrowTab />}
        {currentTabValue === DashboardTabName.LEND && <DashboardLendTab />}
      </div>
    </div>
  )
}

const DASHBOARD_TABS: Tab[] = [
  {
    label: 'Borrow',
    value: DashboardTabName.BORROW,
  },
  {
    label: 'Lend',
    value: DashboardTabName.LEND,
  },
]
