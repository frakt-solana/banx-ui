import { ReactNode } from 'react'

import classNames from 'classnames'
import { VirtuosoGrid } from 'react-virtuoso'

import { getCardOrRowClassName } from '../../helpers'
import { ColumnType, TableViewProps } from '../../types'

import styles from './CardView.module.less'

export const CardView = <T extends object>({
  data,
  columns,
  rowParams,
  loadMore,
}: TableViewProps<T>) => {
  const handleRowClick = (dataRow: T) => {
    if (rowParams?.onRowClick) {
      rowParams?.onRowClick(dataRow)
    }
  }

  return (
    <VirtuosoGrid
      data={data}
      overscan={200}
      endReached={loadMore}
      listClassName={styles.cardList}
      itemContent={(index) => (
        <div
          key={String(data[index])}
          onClick={() => handleRowClick(data[index])}
          className={classNames(
            styles.card,
            getCardOrRowClassName(data[index], rowParams?.activeRowParams, true),
          )}
          style={{ cursor: rowParams?.onRowClick ? 'pointer' : 'default' }}
        >
          {columns.map((column) => (
            <CardRow key={`${column.key}-${index}`} column={column} dataRow={data[index]} />
          ))}
        </div>
      )}
    />
  )
}

interface CardRowProps<T extends object> {
  column: ColumnType<T>
  dataRow: T
}

const CardRow = <T extends object>({ column, dataRow }: CardRowProps<T>) => {
  const { key, title, render } = column || {}

  const renderedTitle = title && key ? title : null
  const renderedValue = render?.(dataRow, key)

  return (
    <div className={styles.cardRow}>
      <div className={styles.cardRowTitle}>{renderedTitle}</div>
      {renderedValue as ReactNode}
    </div>
  )
}
