import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { toLowerCaseNoSpaces, trackPageEvent, useMixpanelLocationTrack } from '@banx/utils'

import { HistoryOffersTable } from './components/HistoryOffersTable'
import OffersHeader from './components/OffersHeader'
import OffersTabContent from './components/OffersTabContent'

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
      {currentTabValue === OffersTabName.HISTORY && <HistoryOffersTable />}
    </div>
  )
}

enum OffersTabName {
  OFFERS = 'offers',
  HISTORY = 'history',
}

const OFFERS_TABS: Tab[] = [
  {
    label: 'Offers',
    value: OffersTabName.OFFERS,
  },
  {
    label: 'History',
    value: OffersTabName.HISTORY,
  },
]
