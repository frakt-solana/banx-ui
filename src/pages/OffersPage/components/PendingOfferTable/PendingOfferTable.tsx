import Table, { TableProps } from '@banx/components/Table'

import styles from './LoansTable.module.less'

type TableViewProps<T, P> = Omit<TableProps<T, P>, 'columns' | 'onRowClick' | 'rowKeyField'>

export const PendingOfferTable = ({
  data,
  sortViewParams,
  breakpoints,
  className,
  loading,
}: TableViewProps<any, any>) => {
  // const columns = getTableColumns()

  return (
    <></>
    // <Table
    //   data={data}
    //   columns={columns}
    //   sortViewParams={sortViewParams}
    //   breakpoints={breakpoints}
    //   className={className}
    //   rowKeyField="publicKey"
    //   loading={loading}
    //   showCard
    // />
  )
}
