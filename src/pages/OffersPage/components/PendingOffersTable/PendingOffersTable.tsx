import Table, { TableProps } from '@banx/components/Table'

import { getTableColumns } from './columns'

type TableViewProps<T, P> = Omit<TableProps<T, P>, 'columns' | 'onRowClick' | 'rowKeyField'>

export const PendingOfferTable = ({
  data,
  sortViewParams,
  className,
  loading,
}: TableViewProps<object, object>) => {
  const columns = getTableColumns()

  return (
    <Table
      data={data}
      columns={columns}
      sortViewParams={sortViewParams}
      className={className}
      rowKeyField="name"
      loading={loading}
      showCard
    />
  )
}
