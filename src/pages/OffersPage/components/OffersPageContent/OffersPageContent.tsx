import { Tabs, useTabs } from '@banx/components/Tabs'

import { OFFERS_TABS, OffersTabName } from '../../constants'
import ActiveOffersTable from '../ActiveOffersTable'
import { HistoryOffersTable } from '../HistoryOffersTable'
import { PendingOfferTable } from '../PendingOffersTable'

import styles from './OffersPageContent.module.less'

const OffersPageContent = () => {
  const {
    tabs: offersTabs,
    value: tabValue,
    setValue: setTabValue,
  } = useTabs({ tabs: OFFERS_TABS, defaultValue: OFFERS_TABS[0].value })

  return (
    <div className={styles.content}>
      <Tabs className={styles.tabs} tabs={offersTabs} value={tabValue} setValue={setTabValue} />
      <div className={styles.tabContent}>
        {tabValue === OffersTabName.PENDING && <PendingOfferTable />}
        {tabValue === OffersTabName.ACTIVE && <ActiveOffersTable />}
        {tabValue === OffersTabName.HISTORY && <HistoryOffersTable />}
      </div>
    </div>
  )
}

export default OffersPageContent
