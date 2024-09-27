import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { ActiveTabContent } from './components/ActiveTabContent'
import { HistoryOffersTable } from './components/HistoryOffersTable'
import OffersHeader from './components/OffersHeader'
import OffersTabContent from './components/OffersTabContent'

import styles from './OffersPage.module.less'

export const OffersPage = () => {
  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: OFFERS_TABS,
    defaultValue: OffersTabName.OFFERS,
  })

  return (
    <div className={styles.pageWrapper}>
      <OffersHeader />
      <Tabs value={currentTabValue} {...tabsProps} />
      {currentTabValue === OffersTabName.OFFERS && <OffersTabContent />}
      {currentTabValue === OffersTabName.LOANS && <ActiveTabContent />}
      {currentTabValue === OffersTabName.HISTORY && <HistoryOffersTable />}
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
