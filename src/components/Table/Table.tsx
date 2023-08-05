import { ColumnsType } from 'antd/es/table'

import { PartialBreakpoints } from './types'
import { TableView } from './views'
import SortView from './views/SortView/SortView'

interface TableProps<T> {
  data: ReadonlyArray<T>
  columns: ColumnsType<T>
  loading?: boolean
  rowKeyField?: string
  onRowClick?: (dataItem: T) => void
  breakpoints?: PartialBreakpoints

  searchSelectParams: any
}

const Table = <T extends object>({
  data,
  columns,
  onRowClick,
  rowKeyField = 'id',
  loading = false,
  breakpoints,
  searchSelectParams,
}: TableProps<T>): JSX.Element => {
  return (
    <>
      <SortView columns={columns} searchSelectParams={searchSelectParams}></SortView>
      <TableView
        className="rootTableClassName"
        data={data}
        columns={columns}
        onRowClick={onRowClick}
        rowKeyField={rowKeyField}
        breakpoints={breakpoints}
        loading={loading}
      />
    </>
  )
}

export default Table
