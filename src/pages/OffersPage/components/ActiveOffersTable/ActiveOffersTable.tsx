import Table, { TableProps } from '@banx/components/Table'

import { Loan } from '@banx/api/core'

import { getTableColumns } from './columns'

type TableViewProps<T, P> = Omit<TableProps<T, P>, 'columns' | 'onRowClick' | 'rowKeyField'>

const ActiveOffersTable = ({
  data,
  sortViewParams,
  className,
  loading,
}: TableViewProps<Loan, any>) => {
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

export default ActiveOffersTable
