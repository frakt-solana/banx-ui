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
  scrollX = 768,
}: TableViewProps<T>) => {
  const rowProps = (rowData: T) => ({
    onClick: onRowClick ? () => onRowClick(rowData) : undefined,
    style: onRowClick && { cursor: 'pointer' },
  })

  return (
    <AntdTable
      rowKey={(record) => record[rowKeyField] as string}
      dataSource={[...data]}
      columns={columns}
      className={className}
      rowClassName={(record) => getCardOrRowClassName(record, activeRowParams)}
      rootClassName="rootTableClassName"
      sortDirections={['descend', 'ascend']}
      onRow={rowProps}
      pagination={false}
      scroll={{ x: scrollX }}
    />
  )
}

export default TableView
