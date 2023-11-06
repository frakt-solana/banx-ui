import { ReactNode } from 'react'

import classNames from 'classnames'
import { VirtuosoGrid } from 'react-virtuoso'

import { TableProps } from '../../Table'
import { getCardOrRowClassName } from '../../helpers'
import { ColumnType } from '../../types'

import styles from './CardView.module.less'

type CardViewProps<T> = Omit<TableProps<T, null>, 'sortViewParams' | 'loading'>

const CardView = <T extends object>({
  data,
  className,
  columns,
  onRowClick,
  activeRowParams,
  loadMore,
}: CardViewProps<T>) => {
  const handleRowClick = (dataRow: T) => {
    if (onRowClick) {
      onRowClick(dataRow)
    }
  }

  return (
    <VirtuosoGrid
      data={data}
      overscan={200}
      endReached={loadMore}
      listClassName={classNames(styles.cardList, className)}
      itemContent={(index) => (
        <div
          key={String(data[index])}
          onClick={() => handleRowClick(data[index])}
          className={classNames(
            styles.card,
            getCardOrRowClassName(data[index], activeRowParams, true),
          )}
          style={{ cursor: onRowClick ? 'pointer' : 'default' }}
        >
          {columns.map((column) => (
            <CardRow key={`${column.key}-${index}`} column={column} dataRow={data[index]} />
          ))}
        </div>
      )}
    />
  )
}

export default CardView

interface CardRowProps<T extends object> {
  column: ColumnType<T>
  dataRow: T
}

const CardRow = <T extends object>({ column, dataRow }: CardRowProps<T>) => {
  const { key, title, render } = column || {}

  const columnKey = key as keyof T
  const renderedTitle = title && columnKey ? (title as ReactNode) : null
  const renderedValue = render?.(dataRow, columnKey as number)

  return (
    <div className={styles.cardRow}>
      <div className={styles.cardRowTitle}>{renderedTitle}</div>
      {renderedValue as ReactNode}
    </div>
  )
}
