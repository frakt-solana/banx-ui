import { ReactElement } from 'react'

import { ColumnType } from 'antd/lib/table'
import { isFunction } from 'lodash'

interface ParsedTableColumn {
  value: string
  label: string
}

export const parseTableColumn = <T>(column: ColumnType<T>): ParsedTableColumn => {
  const { key, title } = column

  const label = isFunction(title)
    ? (title({}) as ReactElement<{ label: string }>).props.label
    : (title as string)

  const value = String(key)

  return { value, label }
}
