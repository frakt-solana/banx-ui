import Table, { TableProps } from '@banx/components/Table'

import { UserOffer } from '@banx/api/core'

import { getTableColumns } from './columns'
import { TableUserOfferData, parseUserOffers } from './helpers'

type TableViewProps<T, P> = Omit<TableProps<T, P>, 'columns' | 'onRowClick' | 'rowKeyField'>

export const PendingOfferTable = ({ data, ...props }: TableViewProps<UserOffer, object>) => {
  const columns = getTableColumns()
  const parsedUserOffers = parseUserOffers(data)

  return (
    <Table<TableUserOfferData, object>
      data={parsedUserOffers}
      columns={columns}
      rowKeyField="publicKey"
      showCard
      {...props}
    />
  )
}
