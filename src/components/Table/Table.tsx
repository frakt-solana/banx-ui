import { ColumnsType } from 'antd/es/table'

import { PartialBreakpoints, SortViewParams } from './types'
import { TableView } from './views'
import SortView from './views/SortView/SortView'

export interface TableProps<T, P> {
  data: ReadonlyArray<T>
  columns: ColumnsType<T>
  sortViewParams: SortViewParams<P>
  loading: boolean

  className?: string
  onRowClick?: (dataItem: T) => void
  breakpoints?: PartialBreakpoints
}

const Table = <T, P extends object>({
  data,
  columns,
  sortViewParams,
  ...props
}: TableProps<T, P>): JSX.Element => {
  return (
    <>
      <SortView columns={columns as ColumnsType<object>} {...sortViewParams} />
      <TableView data={data} columns={columns} {...props} />
    </>
  )
}

export default Table
