import Table from '@banx/components/Table'

import { getTableColumns } from './columns'
import { TableUserOfferData, parseUserOffers } from './helpers'
import { SearchSelectOption, usePendingOfferTable } from './hooks'

export const PendingOfferTable = () => {
  const { offers, loading, sortViewParams } = usePendingOfferTable()

  const columns = getTableColumns()
  const parsedUserOffers = parseUserOffers(offers)

  return (
    <Table<TableUserOfferData, SearchSelectOption>
      data={parsedUserOffers}
      columns={columns}
      rowKeyField="publicKey"
      sortViewParams={sortViewParams}
      loading={loading}
      showCard
    />
  )
}
