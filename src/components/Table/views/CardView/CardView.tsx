import { ReactNode } from 'react'

import { ColumnType } from 'antd/es/table'
import classNames from 'classnames'

import { TableProps } from '../../Table'
import { getCardOrRowClassName } from '../../helpers'

import styles from './CardView.module.less'

type CardViewProps<T> = Omit<TableProps<T, null>, 'sortViewParams' | 'loading'>

const CardView = <T extends object>({
  data,
  className,
  columns,
  onRowClick,
  activeRowParams,
  rowKeyField,
}: CardViewProps<T>) => {
  const handleRowClick = (dataRow: T) => {
    if (onRowClick) {
      onRowClick(dataRow)
    }
  }

  return (
    <div className={classNames(styles.cardList, className)}>
      {data.map((dataRow) => (
        <div
          key={String(dataRow[rowKeyField])}
          onClick={() => handleRowClick(dataRow)}
          className={classNames(styles.card, getCardOrRowClassName(dataRow, activeRowParams, true))}
        >
          {columns.map((column) => (
            <CardRow key={column.key} column={column} dataRow={dataRow} />
          ))}
        </div>
      ))}
    </div>
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
  const renderedTitle = title && columnKey ? (title as () => ReactNode)() : null
  const renderedValue = render ? render(dataRow[columnKey], dataRow, columnKey as number) : null

  return (
    <div className={styles.cardRow}>
      <div className={styles.cardRowTitle}>{renderedTitle}</div>
      {renderedValue as ReactNode}
    </div>
  )
}
