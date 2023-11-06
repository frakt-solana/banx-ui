import { ReactNode } from 'react'

import classNames from 'classnames'
import { TableVirtuoso } from 'react-virtuoso'

import { TableProps } from '../../Table'

// import { getCardOrRowClassName } from '../../helpers'
import styles from './TableView.module.less'

type TableViewProps<T> = Omit<TableProps<T, null>, 'sortViewParams' | 'loading'>

const TableView = <T extends object>({
  data,
  className,
  columns,
  onRowClick, // activeRowParams, //TODO Implement
}: TableViewProps<T>) => {
  const rowProps = {
    onClick: onRowClick ? (rowData: T) => onRowClick(rowData) : () => null,
    style: onRowClick && { cursor: 'pointer' },
  }

  return (
    <TableVirtuoso
      data={data}
      totalCount={data.length}
      overscan={200}
      className={classNames(styles.tableWrapper, className)}
      fixedHeaderContent={() => (
        <tr>
          {columns.map(({ key, title }, index) => {
            return (
              <th key={key} align={index ? 'right' : 'left'}>
                {title}
              </th>
            )
          })}
        </tr>
      )}
      itemContent={(index) => (
        <>
          {columns.map(({ key, render }) => {
            return (
              <td
                key={`${key}-${index}`}
                onClick={() => rowProps.onClick(data[index])}
                style={rowProps.style}
                align="right"
              >
                {render?.(data[index], index) as ReactNode}
              </td>
            )
          })}
        </>
      )}
    />
  )
}

export default TableView
