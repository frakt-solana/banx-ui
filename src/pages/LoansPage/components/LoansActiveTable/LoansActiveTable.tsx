import Table, { TableProps } from '@banx/components/Table'

import { Loan } from '@banx/api/loans'

import { getTableColumns } from './columns'

type TableViewProps<T> = Omit<TableProps<T>, 'columns' | 'onRowClick'>

export const LoansActiveTable = ({
  data,
  sortViewParams,
  breakpoints,
  className,
  loading,
}: TableViewProps<Loan>) => {
  const columns = getTableColumns()

  return (
    <Table
      data={data}
      columns={columns}
      sortViewParams={sortViewParams}
      breakpoints={breakpoints}
      className={className}
      loading={loading}
    />
  )
}
