import { Table as AntdTable } from 'antd'
import classNames from 'classnames'

import styles from './TableView.module.less'

const TableView = ({ data, className, rowKeyField, loading, columns, onRowClick }: any) => {
  return (
    <AntdTable
      className={classNames(className, {
        [styles.noDataTableMessage]: !data.length && !loading,
      })}
      columns={columns as any}
      dataSource={[...data] as any}
      pagination={false}
      sortDirections={['descend', 'ascend']}
      style={onRowClick && { cursor: 'pointer' }}
      rowKey={(data) => data[rowKeyField]}
      onRow={
        (onRowClick
          ? (data: any) => ({
              onClick: () => onRowClick(data as any),
            })
          : null) as any
      }
    />
  )
}

export default TableView
