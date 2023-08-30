import { Tabs, useTabs } from '@banx/components/Tabs'

import { OFFERS_TABS, OffersTabName } from '../../constants'
import ActiveOffersTable from '../ActiveOffersTable'
import { HistoryOffersTable } from '../HistoryOffersTable'
import { PendingOfferTable } from '../PendingOffersTable'

const OffersPageContent = () => {
  const {
    tabs: offersTabs,
    value: tabValue,
    setValue: setTabValue,
  } = useTabs({ tabs: OFFERS_TABS, defaultValue: OFFERS_TABS[0].value })

  return (
    <>
      <Tabs tabs={offersTabs} value={tabValue} setValue={setTabValue} />
      <>
        {tabValue === OffersTabName.PENDING && <PendingOfferTable />}
        {tabValue === OffersTabName.ACTIVE && <ActiveOffersTable />}
        {tabValue === OffersTabName.HISTORY && <HistoryOffersTable />}
      </>
    </>
  )
}

export default OffersPageContent
