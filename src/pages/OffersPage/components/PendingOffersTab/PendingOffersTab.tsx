import { PendingOfferTable } from '../PendingOfferTable'
import { usePendingOfferTab } from './hooks'

const PendingOffersTab = () => {
  const { sortViewParams, offers } = usePendingOfferTab()

  return <PendingOfferTable data={offers} sortViewParams={sortViewParams} />
}

export default PendingOffersTab
