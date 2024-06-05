import { Tab, Tabs, useTabs } from '@banx/components/Tabs'

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
