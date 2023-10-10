import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

import { toLowerCaseNoSpaces, trackPageEvent, useMixpanelLocationTrack } from '@banx/utils'

import ActiveOffersTable from './components/ActiveOffersTable'
import { HistoryOffersTable } from './components/HistoryOffersTable'
import OffersHeader from './components/OffersHeader'
import { PendingOfferTable } from './components/PendingOffersTable'
import { DEFAULT_TAB_VALUE, OFFERS_TABS, OffersTabName } from './constants'

import styles from './OffersPage.module.less'

export const OffersPage = () => {
  useMixpanelLocationTrack('myoffers')

  const { value: currentTabValue, ...tabsProps } = useTabs({
    tabs: OFFERS_TABS,
    defaultValue: DEFAULT_TAB_VALUE,
  })

  const onTabClick = (tabProps: Tab) => {
    trackPageEvent('myoffers', `${toLowerCaseNoSpaces(tabProps.label)}tab`)
  }

  return (
    <div className={styles.pageWrapper}>
      <OffersHeader />
      <Tabs value={currentTabValue} {...tabsProps} onTabClick={onTabClick} />
      {currentTabValue === OffersTabName.PENDING && <PendingOfferTable />}
      {currentTabValue === OffersTabName.ACTIVE && <ActiveOffersTable />}
      {currentTabValue === OffersTabName.HISTORY && <HistoryOffersTable />}
    </div>
  )
}
