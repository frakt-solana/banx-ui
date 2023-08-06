import { Table as AntdTable } from 'antd'

import { Loader } from '@banx/components/Loader'

import { TableProps } from '../../Table'

type TableViewProps<T> = Omit<TableProps<T, null>, 'sortViewParams'>

const TableView = <T extends object>({
  data,
  className,
  columns,
  onRowClick,
  loading,
}: TableViewProps<T>) => {
  if (loading) return <Loader />

  //TODO: Implement empty list component (waiting for design)
  if (!loading && !data?.length) return <>Not found items</>

  const handleRowClick = (rowData: T) => {
    if (onRowClick) {
      onRowClick(rowData)
    }
  }

  return (
    <AntdTable
      rowKey=""
      dataSource={data.slice()}
      columns={columns}
      className={className}
      rootClassName="rootTableClassName"
      sortDirections={['descend', 'ascend']}
      style={onRowClick && { cursor: 'pointer' }}
      onRow={onRowClick ? (rowData) => ({ onClick: () => handleRowClick(rowData) }) : undefined}
      pagination={false}
    />
  )
}

export default TableView
