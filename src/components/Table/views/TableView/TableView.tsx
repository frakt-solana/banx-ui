import React, { ForwardedRef, Ref, forwardRef, memo, useMemo } from 'react'

import classNames from 'classnames'
import { TableVirtuoso } from 'react-virtuoso'

import { getCardOrRowClassName } from '../../helpers'
import { TableRowParams, TableViewProps } from '../../types'

import styles from './TableView.module.less'

const TableViewInner = <T extends object>({
  data,
  className,
  columns,
  rowParams,
  loadMore,
}: TableViewProps<T>) => {
  const rowProps = {
    onClick: rowParams?.onRowClick ? (rowData: T) => rowParams?.onRowClick?.(rowData) : () => null,
    style: rowParams?.onRowClick && { cursor: 'pointer' },
  }

  const tableComponents = useMemo(() => {
    return createTableComponents(rowParams)
  }, [rowParams])

  return (
    <TableVirtuoso
      data={data}
      overscan={200}
      endReached={loadMore}
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
      components={tableComponents}
      itemContent={(index) => (
        <>
          {columns.map(({ key, render }) => {
            return (
              <td key={`${key}-${index}`} style={rowProps.style} align="right">
                {render?.(data[index], index)}
              </td>
            )
          })}
        </>
      )}
    />
  )
}

export const TableView = memo(TableViewInner) as typeof TableViewInner

interface TableRowProps<T>
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  'data-index': number
  item: T
  rowParams?: TableRowParams<T>
}

const TableRowInner = <T,>(
  props: TableRowProps<T>,
  ref: ForwardedRef<HTMLTableRowElement>,
): JSX.Element => {
  const { rowParams, item, ...restProps } = props

  const rowClassName = getCardOrRowClassName(item, rowParams?.activeRowParams)
  const styles = rowParams?.activeRowParams?.[0]?.styles?.(item)

  return (
    <tr
      {...restProps}
      onClick={() => {
        rowParams?.onRowClick?.(item)
      }}
      style={styles}
      ref={ref as Ref<HTMLTableRowElement>}
      className={rowClassName}
    />
  )
}

const TableRow = memo(
  forwardRef(TableRowInner) as <T>(
    props: TableRowProps<T> & { ref?: ForwardedRef<HTMLTableRowElement> },
  ) => ReturnType<typeof TableRowInner>,
)
TableRow.displayName = 'TableRow'

const createTableComponents = <T,>(rowParams?: TableRowParams<T>) => {
  return {
    //? I'm sorry:(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TableRow: (props: any) => <TableRow {...props} rowParams={rowParams} />,
  }
}
