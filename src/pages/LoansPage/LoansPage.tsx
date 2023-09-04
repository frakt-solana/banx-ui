import { Tabs, useTabs } from '@banx/components/Tabs'

import { LoansActiveTable } from './components/LoansActiveTable'
import LoansHeader from './components/LoansHeader'
import { LoansHistoryTable } from './components/LoansHistoryTable'
import { DEFAULT_TAB_VALUE, LOANS_TABS, LoansTabsNames } from './constants'

import styles from './LoansPage.module.less'

export const LoansPage = () => {
  const { value: currentTabValue, ...tabProps } = useTabs({
    tabs: LOANS_TABS,
    defaultValue: DEFAULT_TAB_VALUE,
  })

  return (
    <div className={styles.pageWrapper}>
      <LoansHeader />
      <Tabs value={currentTabValue} {...tabProps} />
      <div className={styles.tableRoot}>
        {currentTabValue === LoansTabsNames.ACTIVE && <LoansActiveTable />}
        {currentTabValue === LoansTabsNames.HISTORY && <LoansHistoryTable />}
      </div>
    </div>
  )
}
