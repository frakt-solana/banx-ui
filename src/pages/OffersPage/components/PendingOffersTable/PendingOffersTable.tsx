import Table from '@banx/components/Table'

import { getTableColumns } from './columns'
import { parseUserOffers } from './helpers'
import { usePendingOfferTable } from './hooks'

export const PendingOfferTable = () => {
  const { offers, loading, sortViewParams } = usePendingOfferTable()

  const columns = getTableColumns()
  const parsedUserOffers = parseUserOffers(offers)

  return (
    <Table
      data={parsedUserOffers}
      columns={columns}
      rowKeyField="publicKey"
      sortViewParams={sortViewParams}
      loading={loading}
      showCard
    />
  )
}
