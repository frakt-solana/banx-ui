import { PendingOfferTable } from '../PendingOffersTable'
import { usePendingOfferTab } from './hooks'

const PendingOffersTab = () => {
  const { sortViewParams, offers } = usePendingOfferTab()

  return <PendingOfferTable data={offers} sortViewParams={sortViewParams} />
}

export default PendingOffersTab
