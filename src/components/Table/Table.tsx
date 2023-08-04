import { ColumnsType } from 'antd/es/table'

import { PartialBreakpoints } from './types'
import { TableView } from './views'

interface TableProps<T> {
  data: ReadonlyArray<T>
  columns: ColumnsType<T>
  loading?: boolean
  rowKeyField?: string
  onRowClick?: (dataItem: T) => void
  breakpoints?: PartialBreakpoints
}

const Table = <T extends object>({
  data,
  columns,
  onRowClick,
  rowKeyField = 'id',
  loading = false,
  breakpoints,
}: TableProps<T>): JSX.Element => {
  return (
    <TableView
      className="rootTableClassName"
      data={data}
      columns={columns}
      onRowClick={onRowClick}
      rowKeyField={rowKeyField}
      breakpoints={breakpoints}
      loading={loading}
    />
  )
}

export default Table
