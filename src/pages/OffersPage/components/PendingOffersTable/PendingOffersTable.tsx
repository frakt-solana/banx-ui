import Table, { TableProps } from '@banx/components/Table'

import { UserOffer } from '@banx/api/core'

import { getTableColumns } from './columns'

type TableViewProps<T, P> = Omit<TableProps<T, P>, 'columns' | 'onRowClick' | 'rowKeyField'>

export const PendingOfferTable = ({
  data,
  sortViewParams,
  className,
  loading,
}: TableViewProps<UserOffer, object>) => {
  const columns = getTableColumns()

  return (
    <Table
      data={data}
      columns={columns}
      sortViewParams={sortViewParams}
      className={className}
      rowKeyField="publicKey"
      loading={loading}
      showCard
    />
  )
}
