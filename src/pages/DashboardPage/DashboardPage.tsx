import { Tabs, useTabs } from '@banx/components/Tabs'

import DashboardHeader from './components/DashboardHeader'
import DashboardLendTab from './components/DashboardLendTab'
import { DASHBOARD_TABS, DEFAULT_TAB_VALUE, DashboardTabName } from './constants'

export const DashboardPage = () => {
  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: DASHBOARD_TABS,
    defaultValue: DEFAULT_TAB_VALUE,
  })

  return (
    <>
      <DashboardHeader />
      <Tabs value={currentTabValue} {...tabsProps} />
      {currentTabValue === DashboardTabName.BORROW && <></>}
      {currentTabValue === DashboardTabName.LEND && <DashboardLendTab />}
    </>
  )
}
