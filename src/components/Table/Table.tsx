import { ColumnsType } from 'antd/es/table'

import { PartialBreakpoints, SortViewParams } from './types'
import { SortView, TableView } from './views'

export interface TableProps<T, P> {
  data: ReadonlyArray<T>
  columns: ColumnsType<T>
  sortViewParams: SortViewParams<P>
  loading: boolean

  className?: string
  onRowClick?: (dataItem: T) => void
  breakpoints?: PartialBreakpoints
}

const Table = <T extends object, P extends object>({
  data,
  columns,
  sortViewParams,
  ...props
}: TableProps<T, P>) => {
  return (
    <>
      <SortView columns={columns} {...sortViewParams} />
      <TableView data={data} columns={columns} {...props} />
    </>
  )
}

export default Table
