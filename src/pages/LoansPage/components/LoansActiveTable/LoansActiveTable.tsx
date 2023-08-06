import Table, { TableProps } from '@banx/components/Table'

import { Loan } from '@banx/api/loans'

import { SearchSelectOption } from '../LoansActiveTab'
import { getTableColumns } from './columns'

type TableViewProps<T, P> = Omit<TableProps<T, P>, 'columns' | 'onRowClick'>

export const LoansActiveTable = ({
  data,
  sortViewParams,
  breakpoints,
  className,
  loading,
}: TableViewProps<Loan, SearchSelectOption>) => {
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
