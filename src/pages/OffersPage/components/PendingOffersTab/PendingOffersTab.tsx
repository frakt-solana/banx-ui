import { PendingOfferTable } from '../PendingOffersTable'
import { usePendingOfferTab } from './hooks'

const PendingOffersTab = () => {
  const { offers, loading, sortViewParams } = usePendingOfferTab()

  return <PendingOfferTable data={offers} loading={loading} sortViewParams={sortViewParams} />
}

export default PendingOffersTab
