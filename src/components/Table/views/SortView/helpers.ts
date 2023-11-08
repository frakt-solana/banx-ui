import { ColumnType } from '../../types'

interface ParsedTableColumn {
  value: string
  label: string
}

export const parseTableColumn = <T>(column: ColumnType<T>): ParsedTableColumn => {
  const { key, title } = column

  const label = title?.props.label

  return { value: key as string, label }
}
