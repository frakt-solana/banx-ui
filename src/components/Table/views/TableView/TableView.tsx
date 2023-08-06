import { Table as AntdTable } from 'antd'
import { ColumnsType } from 'antd/es/table'

import { PartialBreakpoints } from '../../types'

interface TableViewProps<T> {
  data: any
  className?: string
  rowKeyField?: string
  columns: ColumnsType<any>
  onRowClick?: (dataItem: T) => void
  breakpoints?: PartialBreakpoints
}

const TableView = <T extends object>({
  data,
  className,
  rowKeyField = 'id',
  columns,
  onRowClick,
}: TableViewProps<T>) => {
  const handleRowClick = (rowData: any) => {
    if (onRowClick) {
      onRowClick(rowData)
    }
  }

  return (
    <AntdTable
      className={className}
      columns={columns as any}
      dataSource={data.slice()}
      pagination={false}
      sortDirections={['descend', 'ascend']}
      style={onRowClick && { cursor: 'pointer' }}
      rowKey={(data) => data[rowKeyField]}
      onRow={onRowClick ? (rowData) => ({ onClick: () => handleRowClick(rowData) }) : undefined}
    />
  )
}

export default TableView
