import { Table as AntdTable } from 'antd'

const TableView = ({ data, className, rowKeyField, loading, columns, onRowClick }: any) => {
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
