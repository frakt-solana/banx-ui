import { ColumnsType } from 'antd/es/table'

import { PartialBreakpoints, SortParams, ToggleParams } from './types'
import { TableView } from './views'
import SortView from './views/SortView/SortView'

interface TableProps<T> {
  data: ReadonlyArray<T>
  columns: ColumnsType<T>

  searchSelectParams: any
  sortParams?: SortParams
  toggleParams?: ToggleParams

  rowKeyField?: string
  onRowClick?: (dataItem: T) => void
  breakpoints?: PartialBreakpoints
}

const Table = <T extends object>({
  data,
  columns,
  searchSelectParams,
  sortParams,
  toggleParams,
  ...props
}: TableProps<T>): JSX.Element => {
  return (
    <>
      <SortView
        columns={columns}
        searchSelectParams={searchSelectParams}
        sortParams={sortParams}
        toggleParams={toggleParams}
      />
      <TableView className="rootTableClassName" data={data} columns={columns} {...props} />
    </>
  )
}

export default Table
