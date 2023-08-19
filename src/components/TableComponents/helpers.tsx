import { ReactNode } from 'react'

import { ColumnType } from 'antd/es/table'

export const createColumn = <T extends object>({
  key,
  title,
  render,
  dataIndex,
  sorter = false,
}: ColumnType<T>) => {
  return {
    key,
    dataIndex: dataIndex || key,
    title: () => title as ReactNode,
    render: (value: keyof T, data: T, rowIndex: number) => render?.(value, data, rowIndex),
    showSorterTooltip: sorter ? false : undefined,
    sorter,
  }
}
