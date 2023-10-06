import { Tabs, useTabs } from '@banx/components/Tabs'

import GovernanceHeader from './components/GovernanceHeader'
import { DEFAULT_TAB_VALUE, GOVERNANCE_TABS } from './constants'

export const GovernancePage = () => {
  const { value: currentTabValue, ...tabProps } = useTabs({
    tabs: GOVERNANCE_TABS,
    defaultValue: DEFAULT_TAB_VALUE,
  })

  return (
    <>
      <GovernanceHeader />
      <Tabs value={currentTabValue} {...tabProps} />
    </>
  )
}
