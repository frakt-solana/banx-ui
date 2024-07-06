import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { ActiveLoansTable } from './components/ActiveLoansTable'
import LenderTokenActivityTable from './components/LenderTokenActivityTable'
import OffersHeader from './components/OffersHeader'
import OffersTokenTabContent from './components/OffersTokenTabContent'

import styles from './OffersTokenPage.module.less'

export const OffersTokenPage = () => {
  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: OFFERS_TABS,
    defaultValue: OffersTabName.OFFERS,
  })

  return (
    <div className={styles.pageWrapper}>
      <OffersHeader />
      <Tabs value={currentTabValue} {...tabsProps} />
      {currentTabValue === OffersTabName.OFFERS && <OffersTokenTabContent />}
      {currentTabValue === OffersTabName.LOANS && <ActiveLoansTable />}
      {currentTabValue === OffersTabName.HISTORY && <LenderTokenActivityTable />}
    </div>
  )
}

enum OffersTabName {
  OFFERS = 'offers',
  LOANS = 'loans',
  HISTORY = 'history',
}

const OFFERS_TABS: Tab[] = [
  {
    label: 'Offers',
    value: OffersTabName.OFFERS,
  },
  {
    label: 'Loans',
    value: OffersTabName.LOANS,
  },
  {
    label: 'History',
    value: OffersTabName.HISTORY,
  },
]
