import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { toLowerCaseNoSpaces, trackPageEvent, useMixpanelLocationTrack } from '@banx/utils'

import { LoansActiveTable } from './components/LoansActiveTable'
import LoansHeader from './components/LoansHeader'
import { LoansHistoryTable } from './components/LoansHistoryTable'
import { DEFAULT_TAB_VALUE, LOANS_TABS, LoansTabsNames } from './constants'

import styles from './LoansPage.module.less'

export const LoansPage = () => {
  useMixpanelLocationTrack('myloans')

  const { value: currentTabValue, ...tabProps } = useTabs({
    tabs: LOANS_TABS,
    defaultValue: DEFAULT_TAB_VALUE,
  })

  const onTabClick = (tabProps: Tab) => {
    trackPageEvent('myloans', `${toLowerCaseNoSpaces(tabProps.label)}tab`)
  }

  return (
    <div className={styles.pageWrapper}>
      <LoansHeader />
      <Tabs value={currentTabValue} {...tabProps} onTabClick={onTabClick} />
      {currentTabValue === LoansTabsNames.ACTIVE && <LoansActiveTable />}
      {currentTabValue === LoansTabsNames.HISTORY && <LoansHistoryTable />}
    </div>
  )
}
