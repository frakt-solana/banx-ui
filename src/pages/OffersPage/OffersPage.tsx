import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { toLowerCaseNoSpaces, trackPageEvent, useMixpanelLocationTrack } from '@banx/utils'

import { HistoryOffersTable } from './components/HistoryOffersTable'
import OffersHeader from './components/OffersHeader'
import OffersTabContent from './components/OffersTabContent'
import { ActiveLoansTab } from './components/OffersTabContent/components/ActiveLoansTable/ActiveLoansTable'

import styles from './OffersPage.module.less'

export const OffersPage = () => {
  useMixpanelLocationTrack('myoffers')

  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: OFFERS_TABS,
    defaultValue: OFFERS_TABS[0].value,
  })

  const onTabClick = (tabProps: Tab) => {
    trackPageEvent('myoffers', `${toLowerCaseNoSpaces(tabProps.label)}tab`)
  }

  return (
    <div className={styles.pageWrapper}>
      <OffersHeader />
      <Tabs value={currentTabValue} {...tabsProps} onTabClick={onTabClick} />
      {currentTabValue === OffersTabName.OFFERS && <OffersTabContent />}
      {currentTabValue === OffersTabName.ACTIVE && <ActiveLoansTab />}
      {currentTabValue === OffersTabName.HISTORY && <HistoryOffersTable />}
    </div>
  )
}

enum OffersTabName {
  OFFERS = 'offers',
  ACTIVE = 'active',
  HISTORY = 'history',
}

const OFFERS_TABS: Tab[] = [
  {
    label: 'Offers',
    value: OffersTabName.OFFERS,
  },
  {
    label: 'Active',
    value: OffersTabName.ACTIVE,
  },
  {
    label: 'History',
    value: OffersTabName.HISTORY,
  },
]
