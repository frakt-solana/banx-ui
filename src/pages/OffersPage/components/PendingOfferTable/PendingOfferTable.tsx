import Table, { TableProps } from '@banx/components/Table'

import { getTableColumns } from './columns'

import styles from './LoansTable.module.less'

type TableViewProps<T, P> = Omit<TableProps<T, P>, 'columns' | 'onRowClick' | 'rowKeyField'>

export const PendingOfferTable = ({
  data,
  sortViewParams,
  breakpoints,
  className,
  loading,
}: TableViewProps<any, any>) => {
  const columns = getTableColumns() as any

  return (
    <Table
      data={data}
      columns={columns}
      sortViewParams={sortViewParams}
      breakpoints={breakpoints}
      className={className}
      rowKeyField="publicKey"
      loading={loading}
      showCard
    />
  )
}
