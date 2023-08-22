import Table, { TableProps } from '@banx/components/Table'

import { getTableColumns } from './columns'

import styles from './LoansTable.module.less'

type TableViewProps<T, P> = Omit<TableProps<T, P>, 'columns' | 'onRowClick' | 'rowKeyField'>

export const PendingOfferTable = ({
  data,
  sortViewParams,
  className,
  loading,
}: TableViewProps<any, any>) => {
  const columns = getTableColumns()

  return (
    <Table
      data={MOCK_DATA}
      columns={columns}
      sortViewParams={sortViewParams}
      className={className}
      rowKeyField="name"
      loading={loading}
      showCard
    />
  )
}

const MOCK_DATA = [{ name: 'Solana Monkey Business', offer: 120 * 1e9, loans: 5, size: 60 * 1e9 }]
