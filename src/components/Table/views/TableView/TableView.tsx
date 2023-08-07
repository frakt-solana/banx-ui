import { Table as AntdTable } from 'antd'

import { TableProps } from '../../Table'
import { getCardOrRowClassName } from '../../helpers'

type TableViewProps<T> = Omit<TableProps<T, null>, 'sortViewParams' | 'loading'>

const TableView = <T extends object>({
  data,
  className,
  columns,
  onRowClick,
  activeRowParams,
  rowKeyField,
}: TableViewProps<T>) => {
  const handleRowClick = (rowData: T) => {
    if (onRowClick) {
      onRowClick(rowData)
    }
  }

  return (
    <AntdTable
      rowKey={(record) => record[rowKeyField] as string}
      dataSource={data.slice()}
      columns={columns}
      className={className}
      rowClassName={(record) => getCardOrRowClassName(record, activeRowParams)}
      rootClassName="rootTableClassName"
      sortDirections={['descend', 'ascend']}
      style={onRowClick && { cursor: 'pointer' }}
      onRow={onRowClick ? (rowData) => ({ onClick: () => handleRowClick(rowData) }) : undefined}
      pagination={false}
    />
  )
}

export default TableView
